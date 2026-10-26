import {json} from './_shared.mjs';import {clearCookie} from './_session.mjs';export default async()=>json({ok:true},200,{'set-cookie':clearCookie()});
