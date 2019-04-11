const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const options = getOptions();

  const root = j(file.source);

  root.find(j.ExportDefaultDeclaration).forEach(path => {
    let dec = path.value.declaration;
    let props = dec.arguments[0].properties;

    let entityType = dec.callee.object.type === "Identifier" ? dec.callee.object.name : dec.callee.object.property.name;
    //console.log(entityType);
    let destroyHooksTable = {
      'Component': 'willDestroyElement',
      'Service': 'willDestroy'
    };

    let destroyHook = destroyHooksTable[entityType];
    //console.log(destroyHook)

    let destroyFilter = p => {
      return p.value ? p.value.type === "FunctionExpression" && p.key.name === destroyHook
        : p.type === "FunctionExpression" && p.key.name === destroyHook;
    };

    let initFn = props.filter(destroyFilter)[0];

    //console.log(initFn)

    let initFnBody;
    if(initFn) {
      initFnBody = initFn.value.body.body;
    } else {
      // We don't have an init() , hence create one

      let superCall = j.expressionStatement(j.callExpression(j.memberExpression(j.thisExpression(),j.identifier('_super'),false),[j.identifier('...arguments')]))
      let initProp = j.property("init",j.identifier(destroyHook), j.functionExpression(null,[],j.blockStatement([superCall]),false,false));

      props.push(initProp);
      initFn = props.filter(destroyFilter)[0];
      initFnBody = initFn.value.body.body;
    }

    let addedListeners = [];

    j(props).find(j.CallExpression, {
      callee: { 
        property: {name : "addEventListener"}
      }
    })
      .forEach(m => {

     // Normalize the handler
      if(m.value.arguments[1].type !== "MemberExpression") {
        
        // Create a member expression
        
const capitalizedEventName = eventname => {
  return eventname
    .split()
    .map(s => {
      return s[0].toUpperCase() + s.slice(1);
    })
    .join("");
};
        let handlerName = `_on${capitalizedEventName(m.value.arguments[0].value)}Handler`;
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

        //console.log(m)
        //console.log(m.value.callee.object.name);
        //console.log(m.value.arguments[0].value);
        
        let listener = {
          el: m.value.callee.object.name,
          event: m.value.arguments[0].value
        };

        removedListeners.push(listener);


      });

    //console.log(addedListeners);
    //console.log(removedListeners);

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
        initFnBody.unshift(removeEventListener);
      }
    });

  });

  return root.toSource();

}
