import {json} from './_shared.mjs';import {clearPlatformCookie} from './_session.mjs';
export default async()=>json({ok:true},200,{'set-cookie':clearPlatformCookie()});
