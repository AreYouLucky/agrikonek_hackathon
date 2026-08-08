export type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: number;
};

export type Page = {
    id: number;
    url: string;
    title: string | null;
    owner: string | null;
    description: string | null;
    created_at: string;
    updated_at: string;
    posts?: Post[];
};

export type Post = {
    id: number;
    page_id: number;
    title: string | null;
    content: string | null;
    views_count: number;
    likes_count: number;
    wow_count: number;
    love_count: number;
    care_count: number;
    angry_count: number;
    sad_count: number;
    shares_count: number;
    date_posted: string;
    date_generated: string;
    created_at: string;
    updated_at: string;
    page?: Page;
    comments?: PostComment[];
};

export type PostComment = {
    id: number;
    post_id: number;
    author: string | null;
    gender: string | null;
    content: string | null;
    depth: number | null;
    likes_count: number;
    url: string | null;
    created_at: string;
    updated_at: string;
    post?: Post;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
