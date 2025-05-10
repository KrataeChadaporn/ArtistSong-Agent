import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const getSpotifyAccessToken = async () => {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        throw new Error("❌ ไม่สามารถรับ access token จาก Spotify ได้");
    }

    return tokenData.access_token;
};

export const searchSongByArtist = async (artistName: string) => {
    const accessToken = await getSpotifyAccessToken();

    // 1. ค้นหา artist
    const searchArtistUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`;
    const artistRes = await fetch(searchArtistUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const artistData = await artistRes.json();
    const artist = artistData.artists.items?.[0];

    if (!artist) {
        throw new Error(`❌ ไม่พบศิลปินชื่อ "${artistName}"`);
    }

    const artistId = artist.id;

    // 2. ดึง top tracks ของศิลปิน
    const topTracksUrl = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`; // เปลี่ยน market ได้ตามต้องการ
    const tracksRes = await fetch(topTracksUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    const trackData = await tracksRes.json();
    const tracks = trackData.tracks;

    if (!tracks || tracks.length === 0) {
        throw new Error(`❌ ไม่พบเพลงของ "${artistName}"`);
    }

    // 3. เลือกเพลงแบบสุ่ม
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];

    return [{
        name: randomTrack.name,
        url: randomTrack.external_urls.spotify,
        artist: randomTrack.artists[0].name,
        image: randomTrack.album.images?.[0]?.url ?? "",
        embedUrl: `https://open.spotify.com/embed/track/${randomTrack.id}`,
    }];
    
};
