export interface ValidateCommandOptions {
    /** Target path to validate (defaults to current directory) */
    path?: string;
}
export declare class ValidateCommand {
    private readonly targetPath;
    constructor(options?: ValidateCommandOptions);
    execute(): Promise<void>;
    private validateProjectMd;
    private validateChanges;
    private validateSpecs;
    private exists;
}
//# sourceMappingURL=validate.d.ts.map