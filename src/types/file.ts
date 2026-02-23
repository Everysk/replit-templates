export type File = {
    id: string;
    workspace: string;
    name: string;
    description?: string;
    content_type: string;
    url?: string;
    hash?: string;
    storage?: boolean;
    date?: string;
    date_time?: string;
    created?: number;
    updated?: number;
    version: string;
    link_uid: string | null;
    data: string | null;
    tags?: string[];
}