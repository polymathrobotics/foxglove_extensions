/** @type {import("eslint").Rule.RuleModule} */
module.exports = {
  meta: {
    type: "suggestion",
    fixable: "code",
    schema: [],
    messages: {
      returnResolve: `Values must be returned directly from async functions`,
      returnReject: `Errors must be thrown directly from async functions`,
    },
  },

  create(context) {
    return {
      [`:matches(:function[async=true] ReturnStatement, ArrowFunctionExpression[async=true]) > CallExpression > MemberExpression[object.name="Promise"][property.name=/^(resolve|reject)$/].callee`]:
        /**
         * @param {(
         *   import("estree").MemberExpression & {
         *     parent: import("estree").CallExpression & {
         *       parent: import("estree").ReturnStatement | import("estree").ArrowFunctionExpression
         *     }
         *     property: import("estree").MemberExpression["property"] & { name: string }
         *   }
         * )} node
         */
        (node) => {
          // The AST selector ensures that we are somewhere within an async function, but we might
          // be in a nested function that is not async. Check that the innermost function scope is
          // actually async.
          const functionScope = context.sourceCode.getScope(node).variableScope;
          if (
            functionScope.type !== "function" ||
            !(
              /** @type {Partial<import("estree").Function>} */ (
                functionScope.block
              ).async
            )
          ) {
            return;
          }
          const sourceCode = context.getSourceCode();
          const returnOrArrowFunction = node.parent.parent;
          const callExpr = node.parent;
          const isReturn = returnOrArrowFunction.type === "ReturnStatement";
          const isArrowFunction = !isReturn;
          const isReject = node.property.name === "reject";
          context.report({
            node: isReject && isReturn ? returnOrArrowFunction : callExpr,
            messageId: isReject ? "returnReject" : "returnResolve",
            fix(fixer) {
              if (callExpr.arguments.length === 0) {
                return fixer.replaceText(callExpr, "undefined");
              }
              if (isReject) {
                if (isArrowFunction) {
                  return fixer.replaceText(
                    returnOrArrowFunction.body,
                    `{ throw ${sourceCode.getText(callExpr.arguments[0])}; }`
                  );
                } else {
                  return fixer.replaceText(
                    returnOrArrowFunction,
                    `throw ${sourceCode.getText(callExpr.arguments[0])};`
                  );
                }
              }
              const firstArgToken =
                callExpr.arguments[0] &&
                sourceCode.getFirstToken(callExpr.arguments[0]);
              const needsParens =
                isArrowFunction &&
                firstArgToken?.type === "Punctuator" &&
                firstArgToken.value === "{";
              const argText = sourceCode.getText(callExpr.arguments[0]);
              return fixer.replaceText(
                callExpr,
                needsParens ? `(${argText})` : argText
              );
            },
          });
        },
    };
  },
};
