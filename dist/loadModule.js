"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadModule = void 0;
function loadModule(t, p, state, opts, translations) {
    const nodes = [];
    nodes.push(t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('i18n'), t.callExpression(t.identifier('require'), [t.stringLiteral('i18n-js')]))
    ]));
    nodes.push(t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier('i18n'), t.identifier('locale')), t.stringLiteral(opts.locale))));
    nodes.push(t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier('i18n'), t.identifier('fallbacks')), t.booleanLiteral(opts.fallbacks))));
    nodes.push(t.expressionStatement(t.assignmentExpression('=', t.memberExpression(t.identifier('i18n'), t.identifier('translations')), t.valueToNode(translations))));
    p.replaceWithMultiple(nodes);
}
exports.loadModule = loadModule;
