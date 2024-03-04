import { defaultDomain } from "@constants"

export const  getCookie:any = async(id:any,botId:string)=>{
    const response = await fetch(`${defaultDomain}/sparky/set-sparky-client-cookie`,{
        method:"POST",   
        credentials: "include",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body:JSON.stringify({id,botId})
      })

      if(response.status === 200){
          const data = await response.json()
          return data
      }else if(response.status === 400){
        console.log(response)
    }else if(response.status === 500){
      console.log(response)
    }else{
       return getCookie(id,botId)
      }
}

export const  getConversationsHelper:any = async(botId:string)=>{
    const url = new URL(`${defaultDomain}/sparky/conversations/`)
    url.search = new URLSearchParams({botId}).toString()
    const response = await fetch(url,{
        method:"GET",   
        credentials: "include",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          
      })

      if(response.status === 200){
          const data = await response.json()
          return data
      }else if(response.status === 400){
          console.log(response)
      }else if(response.status === 500){
        console.log(response)
      }else{
       return getConversationsHelper(botId)
      }
}