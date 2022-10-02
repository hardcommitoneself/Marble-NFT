import axios from "axios";
export interface NftInfo {
    readonly address: string
    readonly tokenId: string
    readonly image: string
    readonly name: string
    user: string
    price: string
    readonly total: number
    readonly collectionName: string
    symbol: string
    paymentToken: any
    sale: any
    type: string
    created: string
    collectionId: number
}
export interface NftCategory {
    readonly id: string
    readonly slug: string
    readonly name: string
}
export interface NftCollection {
    readonly id: number
    readonly image: string
    readonly num_tokens: number
    readonly name: string
    readonly description: string
    readonly creator: string
    readonly banner_image: string
    readonly slug: string
    readonly cat_ids: string,
    type: string
}
export interface CollectionToken {
    readonly name: string
    readonly symbol: string
    readonly logoUri: string
    readonly denom: string
    readonly address: string
    readonly type: string
}
export interface PaymentToken {
    readonly name: string
    readonly symbol: string
    readonly logoUri: string
    readonly denom: string
    readonly address: string
    readonly type: string
}
export const SALE_TYPE = ["Fixed", "Auction"]
export const OWNED = 0
export const CREATED = 1
export const videoTypes = [
'm4v', 'avi', 'mpg', 'mp4', 'mkv', '3gpp', 'webm', 
'video/mp4', 'video/mpg', 'video/avi', 'video/m4v', 'video/mkv', 'video/3gpp', 'video/webm'
]

export const audioTypes = ['mp3', 'wav', 'ogg', 'audio/mp3', 'audio/wav', 'audio/ogg']

export async function getFileTypeFromURL(url) {
try {
    const req = await fetch(url);
    let fileType = null;
    const mimeType = await req.headers.get("content-type");

    if (videoTypes.includes(mimeType)) {
    fileType = 'video';
    } else if (audioTypes.includes(mimeType)) {
    fileType = 'audio';
    } else {
    fileType = 'image';
    }

    return {mimeType: mimeType, fileType: fileType};
} catch (e) {
    console.log(e);

    return {mimeType: "image/png", fileType: "image"};
}
}