"use strict";
const url = require("url");
const path = require("path");
const Asset_1 = require("./Asset");
const isURL = require("parcel-bundler/lib/utils/is-url");
const load = require("pug-load");
const lexer = require("pug-lexer");
const parser = require("pug-parser");
const walk = require("pug-walk");
const linker = require("pug-linker");
const generateCode = require("pug-code-gen");
const wrap = require("pug-runtime/wrap");
const filters = require("pug-filters");
// A list of all attributes that should produce a dependency
// Based on https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes
const ATTRS = {
    src: [
        'script',
        'img',
        'audio',
        'video',
        'source',
        'track',
        'iframe',
        'embed'
    ],
    href: ['link', 'a'],
    poster: ['video']
};
module.exports = class PugAsset extends Asset_1.Asset {
    constructor(name, pkg, options) {
        super(name, pkg, options);
        this.type = 'html';
    }
    parse(code) {
        let ast = load.string(code, {
            lex: lexer,
            parse: parser,
            filename: this.name
        });
        ast = linker(ast);
        ast = filters.handleFilters(ast);
        return ast;
    }
    collectDependencies() {
        walk(this.ast, node => {
            if (node.filename !== this.name && !this.dependencies.has(node.filename)) {
                this.addDependency(node.filename, {
                    name: node.filename,
                    includedInParent: true
                });
            }
            if (node.attrs) {
                for (const attr of node.attrs) {
                    const elements = ATTRS[attr.name];
                    if (node.type === 'Tag' && elements && elements.indexOf(node.name) > -1) {
                        if (["'", '"'].indexOf(attr.val.charAt(0)) < 0) {
                            return;
                        }
                        let assetPath = attr.val.substring(1, attr.val.length - 1);
                        assetPath = this.addURLDependency(assetPath);
                        if (!isURL(assetPath)) {
                            // Use url.resolve to normalize path for windows
                            // from \path\to\res.js to /path/to/res.js
                            assetPath = url.resolve(path.join(this.options.publicURL, assetPath), '');
                        }
                        attr.val = `'${assetPath}'`;
                    }
                }
            }
            return node;
        });
    }
    generate() {
        const result = generateCode(this.ast, {
            compileDebug: false,
            pretty: !this.options.minify
        });
        return { html: wrap(result)() };
    }
    shouldInvalidate() {
        return false;
    }
    generateBundleName() {
        const ext = '.' + this.type;
        return path.basename(this.name, path.extname(this.name)) + ext;
    }
};
//# sourceMappingURL=PugAsset.js.map