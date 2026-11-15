/**
 * Interoperability module: all browser-to-PHP HTTP communication lives here.
 * fetch() is asynchronous and sends/receives JSON over HTTP.
 */
let token='';
export function setToken(value){token=value||'';}
export async function api(path, body){
  const options={credentials:'same-origin',headers:{'Accept':'application/json'}};
  if(body!==undefined){options.method='POST';options.headers['Content-Type']='application/json';options.headers['X-CSRF-Token']=token;options.body=JSON.stringify(body);}
  let response;
  try{response=await fetch(`server/${path}`,options);}catch{throw new Error('Cannot connect to PHP server. Open the app through localhost, not by double-clicking the file.');}
  let result;
  try{result=await response.json();}catch{throw new Error('Server returned invalid JSON. Check PHP is running.');}
  if(!response.ok)throw new Error(result.error||`HTTP error ${response.status}`);
  return result;
}
