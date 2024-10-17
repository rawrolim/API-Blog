export default interface PostInterface{
    id: number;
    title: string;
    content: string;
    category: string;
    tags: any;
    createdat: Date;
    updatedat: Date;
}