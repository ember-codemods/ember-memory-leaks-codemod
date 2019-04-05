const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const options = getOptions();
  const root = j(file.source);

  const ignoreProps = [
    'classNames', 
    'classNameBindings',
    'attributeBindings',
    'queryParams'
  ];

  root.find(j.ExportDefaultDeclaration).forEach(path => {
    let dec = path.value.declaration;
    let props = dec.arguments[0].properties;

    let initFn = props.filter(p => { 
      return p.key.name === "init"
    })[0];


    let initFnBody;
    if(initFn) {
      initFnBody = initFn.value ? initFn.value.body.body : initFn.body.body;
    } else {
      // We don't have an init() , hence create one

      // First create the super call for init
      let superCall = j.expressionStatement(
        j.callExpression(
          j.memberExpression(
            j.thisExpression(),
            j.identifier('_super'),
            false
          ),[j.identifier('...arguments')]));

      let initProp = j.property(
        "init",
        j.identifier('init'), 
        j.functionExpression(null,[],j.blockStatement([superCall]),false,false));

      props.push(initProp);

      // Get the body of newly created init function
      initFn = props.filter(p => p.key.name === "init")[0];
      initFnBody = initFn.value.body.body;
    }

    let arrExps = props.filter(p => {
      return p.value ? p.value.type === "ArrayExpression" : p.type === "ArrayExpression";
    });

    // Adding new set expressions for each array expression
    arrExps.forEach(p => {

      let thisExp = j.expressionStatement(
        j.assignmentExpression(
          '=',
          j.memberExpression(
            j.thisExpression(),
            j.identifier('_data'), 
            false)
          ,j.arrayExpression(p.value.elements)));

      initFnBody.push(thisExp);

      // Removing array expression values from properties
      props.splice(props.findIndex(p => p.value.type === "ArrayExpression" && !ignoreProps.includes(p.key.name)),1);

    });

  });

  return root.toSource();
}