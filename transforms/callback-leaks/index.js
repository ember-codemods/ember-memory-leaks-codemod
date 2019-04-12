const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const options = getOptions();

  const root = j(file.source);

  root.find(j.ExportDefaultDeclaration).forEach(path => {
    let dec = path.value.declaration;
    let props = dec.arguments[0].properties;

    let entityType = dec.callee.object.type === "Identifier" 
      ? dec.callee.object.name 
      : dec.callee.object.property.name;

    const destroyHooksTable = {
      'Component': 'willDestroyElement',
      'Service': 'willDestroy'
    };

    let hookName = destroyHooksTable[entityType];

    let destroyFilter = p => {
      return p.value ? p.value.type === "ObjectMethod" && p.key.name === hookName
        : p.type === "ObjectMethod" && p.key.name === hookName;
    };


    let destroyHook = props.find(destroyFilter);


    let addedListeners = [];

    j(props).find(j.CallExpression, {
      callee: { 
        property: {name : "addEventListener"}
      }
    })
      .forEach(m => {

        // Normalize the handler
        if(m.value.arguments[1].type !== "MemberExpression") {

          const capitalizedEventName = eventname => {
            return eventname
              .split()
              .map(s => {
                return s[0].toUpperCase() + s.slice(1);
              })
              .join("");
          };

          let handlerName = `_on${capitalizedEventName(m.value.arguments[0].value)}Handler`;

          // Create a member expression
          let mExp = j.memberExpression(j.thisExpression(),j.identifier(handlerName),false);
          let expSt = j.expressionStatement(j.assignmentExpression(
            '=',
            mExp,
            m.value.arguments[1]
          ));

          m.parentPath.parentPath.value.unshift(expSt);
          m.value.arguments[1] = mExp;

        }

        let listener = {
          el: m.value.callee.object.name,
          event: m.value.arguments[0].value,
          handler: m.value.arguments[1]
        };

        addedListeners.push(listener);

      });

    let removedListeners = [];

    j(props).find(j.CallExpression, {
      callee: { 
        property: {name : "removeEventListener"}
      }
    })
      .forEach(m => {

        let listener = {
          el: m.value.callee.object.name,
          event: m.value.arguments[0].value
        };

        removedListeners.push(listener);

      });


    addedListeners.forEach(a => {
      let idx = removedListeners.findIndex(function(r) {
        return r.el = a.el
      });

      if(idx < 0) {
        // No removeEventListener
        let removeEventListener = j.expressionStatement(
          j.callExpression(
            j.memberExpression(
              j.identifier(a.el),
              j.identifier('removeEventListener'),
              false),[j.literal(a.event), a.handler]));


        let destroyHookBody;

        if(destroyHook) {
          destroyHookBody = destroyHook.body.body;
          destroyHookBody.unshift(removeEventListener);
        } else {
          // We don't have an willDestory() , hence create one

          let superCall = j.expressionStatement(
            j.callExpression(
              j.memberExpression(
                j.thisExpression(),
                j.identifier('_super'),false),
              [j.identifier('...arguments')]));

          let willDestroyProp = j.property(
            "init",
            j.identifier(hookName), 
            j.functionExpression(null,[],j.blockStatement([removeEventListener, superCall]),false,false));

          props.push(willDestroyProp);
        }


      }
    });

  });

  return root.toSource();

}
