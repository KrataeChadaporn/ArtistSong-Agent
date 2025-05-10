import { translatPromtThaiToEnglish } from './translate';
import { searchSongByArtist } from '../entity/song-spotify'; 

export const tools = [
    {
        type: 'function',
        function: {
            name: 'searchSongByArtist',
            description: 'Searches a random song on Spotify from a given artist name.',
            parameters: {
                type: 'object',
                properties: {
                    artist: { type: 'string' }
                },
                required: ['artist']
            }
        }
    },
    {
        type: 'function',
        function: {
            name: 'translatPromtThaiToEnglish',
            description: 'Translates a prompt from Thai to English.',
            parameters: {
                type: 'object',
                properties: {
                    promt: { type: 'string' }
                },
                required: ['promt']
            }
        }
    }
];

export const availableTools: { [key: string]: Function } = {
    'translatPromtThaiToEnglish': translatPromtThaiToEnglish,
    'searchSongByArtist': searchSongByArtist
};
