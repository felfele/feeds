import { fetchHtmlMetaData } from "../helpers/htmlMetaData";
import { Post } from "../models/Post";
import { output } from "./cliHelpers";
import { addCommand } from "./cliParser";

export const postCommand =
    addCommand('create <url>', 'Create post based on metadata of an url', async (url) => {
        const meta = await fetchHtmlMetaData(url)
        const post: Post = {
            _id: meta.url,
            text: `**${meta.title}**\n\n${meta.description}`,
            images: [{ 
                uri: meta.image,
                width: 480,
                height: 360,        
            }],
            createdAt: meta.createdAt || Date.now(),
            link: meta.url,
            author: {
                name: meta.name,
                uri: meta.url,
                image: { uri: meta.icon },
            }
        }
        output(JSON.stringify(post, undefined, 4))
    })