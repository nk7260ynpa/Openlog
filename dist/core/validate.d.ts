export interface ValidateCommandOptions {
    /** 要驗證的目標路徑（預設為當前目錄） */
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