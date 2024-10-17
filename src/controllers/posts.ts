import { Request, Response } from "express";
import { query } from "../configs/pg";
import PostInterface from "../interfaces/post";

export async function getAllPosts(req: Request, res: Response) {
    try {
        let rs_posts: PostInterface[] = await query("SELECT * FROM posts ORDER BY id DESC");
        rs_posts.map(post => {
            post.tags = post.tags.split(",");
        });

        const term: any = req.query.term;
        if(term){
            rs_posts = rs_posts.filter(post => 
                post.title.toUpperCase().includes(term.toUpperCase()) ||
                post.category.toUpperCase().includes(term.toUpperCase()) ||
                post.content.toUpperCase().includes(term.toUpperCase())
            );
        }

        res.status(200).json(rs_posts);
    } catch (err: any) {
        console.error(err.toString());
        res.status(400).json(err.toString());
    }
}

export async function getPost(req: Request, res: Response) {
    try {
        const body = req.params;
        if (!body.id)
            throw new Error("Need to inform the post id");
        const rs_posts: PostInterface[] = await query("SELECT * FROM posts WHERE id=$1", [body.id]);
        if (rs_posts.length == 0)
            throw new Error("Blog id don't exist");
        const post = rs_posts[0];
        post.tags = post.tags.split(',');

        res.status(200).json(post);
    } catch (err: any) {
        console.error(err.toString());
        res.status(400).json(err.toString());
    }
}

export async function deletePost(req: Request, res: Response) {
    try {
        const body = req.params;
        if (!body.id)
            throw new Error("Need to inform the post id");
        const rs_posts: PostInterface[] = await query("SELECT * FROM posts WHERE id=$1", [body.id]);
        if (rs_posts.length == 0)
            throw new Error("Blog id don't exist");
        await query("DELETE FROM posts WHERE id=$1", [body.id]);
        res.status(200);
    } catch (err: any) {
        console.error(err.toString());
        res.status(400).json(err.toString());
    }
}

export async function updatePost(req: Request, res: Response) {
    try {
        const body = req.body;
        const rs_post_old: PostInterface[] = await query("SELECT * FROM posts WHERE id=$1", [req.params.id]);
        if (rs_post_old.length == 0)
            throw new Error("Blog id don't exist");
        if (body.title)
            throw new Error("Need inform the title.");
        if (body.content)
            throw new Error("Need inform the content.");
        if (body.category)
            throw new Error("Need inform the category.");
        if (body.tags)
            throw new Error("Need inform the tags.");

        const values = [body.title, body.content, body.category, body.tags, new Date(), req.params.id]
        const sql = `UPDATE posts SET 
            title = $1,
            content = $2,
            category = $3,
            tags = $4,
            updatedAt = $5
        WHERE id = $6`;
        await query(sql, values);

        const rs_post: PostInterface[] = await query("SELECT * FROM posts WHERE id=$1", [req.params.id]);
        const post = rs_post[0];
        post.tags = post.tags.split(',');

        res.status(200).json(post);
    } catch (err: any) {
        console.error(err.toString());
        res.status(400).json(err.toString());
    }
}

export async function createPost(req: Request, res: Response) {
    try {
        const { body } = req;

        if (body.title)
            throw new Error("Need inform the title.");
        if (body.content)
            throw new Error("Need inform the content.");
        if (body.category)
            throw new Error("Need inform the category.");
        if (body.tags)
            throw new Error("Need inform the tags.");

        const values = [body.title, body.content, body.category, body.tags.join(',')];

        const sql = `INSERT INTO posts SET (
            title,
            content,
            category,
            tags
        ) VALUES(
            $1,
            $2,
            $3,
            $4
        )`;
        await query(sql, values);
        const rs_posts: PostInterface[] = await query("SELECT * FROM posts WHERE title=$1 ORDER BY id DESC LIMIT 1",[body.title]);
        const posts = rs_posts[0];
        posts.tags = posts.tags.split(',');

        res.status(200).json(posts);
    } catch (err: any) {
        console.error(err.toString());
        res.status(400).json(err.toString());
    }
}