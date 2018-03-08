declare const _default: {
    new (name: string, pkg: string, options: any): {
        type: string;
        parse(code: string): any;
        collectDependencies(): void;
        generate(): {
            html: any;
        };
        shouldInvalidate(): boolean;
        addDependency(path: string, options: Object): any;
        addURLDependency(url: string): string;
        name: string;
        isAstDirty: boolean;
        contents: string;
        ast: any;
        options: any;
        dependencies: Set<Object>;
    };
};
export = _default;
