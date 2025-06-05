import 'dotenv/config';

export default {
    expo: {
        name: 'ChatCaddy',
        slug: 'chatcaddy',
        extra: {
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
            eas: {
                projectId: "9803f32a-19ab-419b-bf0e-e3a91f7043aa"
            }
        },
        owner: 'shayebertowski',
        backgroundColor: "#FAFAFA",
        updates: {
            url: "https://u.expo.dev/9803f32a-19ab-419b-bf0e-e3a91f7043aa"
        },
        runtimeVersion: "1.0.0",
        "scheme": "chatcaddy"
    },
};
