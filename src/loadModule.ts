import type * as BabelCoreNamespace from '@babel/core'
import { Node } from '@babel/types'

import { Options } from './plugin'

export function loadModule(t: typeof BabelCoreNamespace.types, p: BabelCoreNamespace.NodePath<BabelCoreNamespace.types.ImportDeclaration>, state: BabelCoreNamespace.PluginPass, opts: Options, translations: Object) {
    const nodes: Node[] = []
    nodes.push(t.variableDeclaration(
        'const',
        [
            t.variableDeclarator(t.identifier('i18n'),
                t.callExpression(t.identifier('require'),
                    [t.stringLiteral('i18n-js')]))
        ]
    ))

    nodes.push(t.expressionStatement(
        t.assignmentExpression('=',
            t.memberExpression(t.identifier('i18n'), t.identifier('locale')),
            t.stringLiteral(opts.locale)
        )))

    nodes.push(t.expressionStatement(
        t.assignmentExpression('=',
            t.memberExpression(t.identifier('i18n'), t.identifier('fallbacks')),
            t.booleanLiteral(opts.fallbacks)
        )))

    nodes.push(t.expressionStatement(
        t.assignmentExpression('=',
            t.memberExpression(t.identifier('i18n'), t.identifier('translations')),
            t.valueToNode(translations)
        )))

    p.replaceWithMultiple(nodes)
}