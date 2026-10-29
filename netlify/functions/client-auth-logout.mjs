import {json} from './_shared.mjs';import {clearClientCookie} from './_session.mjs';
export default async()=>json({ok:true},200,{'set-cookie':clearClientCookie()});
