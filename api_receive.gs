function doGet(e) {
  try {
    const timeNow = new Date()
    const params = e.parameter
    const hmacParamKeys = ["nonce","timestamp","signature"]
    let baseParams = {}
    let validatedApiAccount
    if (params.apiKey) {
      const apiAccounts = getDocProp("apiGiveAccess")
      const statedApiAccount = apiAccounts[params.apiKey]
      Object.keys(params).forEach(key => {
        if (hmacParamKeys.indexOf(key) === -1) baseParams[key] = params[key]
      })
      let receivedTimestamp = new Date(params.timestamp)
      let timePassed = timeNow.getTime() - receivedTimestamp.getTime() // In milliseconds
      if (params.signature === generateHmacHexString(statedApiAccount.secret, params.nonce, params.timestamp, baseParams) && 
          timePassed < 300000) {
        validatedApiAccount = statedApiAccount
      }
    }
  
    let output = ContentService.createTextOutput()
    output.setMimeType(ContentService.MimeType.JSON)
    let content = {}
    if (validatedApiAccount) {
      if (params.version === "v1") {
        if (params.resource === "runs") {
          content.status = "OK"
          content.runs = shareRuns()
        } else if (params.resource === "trips") {
          content.status = "OK"
          content.runs = shareTrips()
        } else {
          content.status = "INVALID_REQUEST"
        }
      } else {
        content.status = "INVALID_REQUEST"
      }
    } else {
      content.status = "UNAUTHORIZED"
    }
    output.setContent(JSON.stringify(content))
    return output
  } catch(e) { logError(e) }
}
  
function doPost(e) {
  let output = ContentService.createTextOutput()
  output.setContent(JSON.stringify(e))
  output.setMimeType(ContentService.MimeType.JSON)
  return output
}