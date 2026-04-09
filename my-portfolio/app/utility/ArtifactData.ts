
export interface ArtifactData{
    [className: string]: {
        [functionName: string]: {
            [contentSection: string]: string;
        }
    }
}
