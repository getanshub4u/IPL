var params = {
  CLIENT_ID: '213564201322-dhpqqfvm1d5km879p08k6mkim6dk2lt0.apps.googleusercontent.com',
  CLIENT_SECRET: 'NXFazpqhiDIH62AKo8-0I3eY',
  BUCKET_NAME: 'ipl_landing',
  FILE_PATH_NEW: 'compressed/new.zip',
  URL_NEW: 'https://cricsheet.org/downloads/ipl_csv2.zip',
  FILE_PATH_YAML: 'compressed/yaml.zip',
  URL_YAML: 'https://cricsheet.org/downloads/ipl.zip',
  FILE_PATH_OLD: 'compressed/old.zip',
  URL_OLD: 'https://cricsheet.org/downloads/ipl_csv.zip'
};

function mainline() {
uploadFileToGCS(params.URL_NEW,params.FILE_PATH_NEW);
uploadFileToGCS(params.URL_YAML,params.FILE_PATH_YAML);
uploadFileToGCS(params.URL_OLD,params.FILE_PATH_OLD);
}

function uploadFileToGCS(URL,PATH) {

  var service = getService();
  if (!service.hasAccess()) {
    Logger.log("Please authorize %s", service.getAuthorizationUrl());
    return;
  }

  var fileName = "";
  var fileSize = 0;

  var response = UrlFetchApp.fetch(URL, {muteHttpExceptions: true});
  var rc = response.getResponseCode();

  if (rc == 200) {
    var blob = response.getBlob()
	var bytes = blob.getBytes();
      }
  
 
  
  var url = 'https://www.googleapis.com/upload/storage/v1/b/BUCKET/o?uploadType=media&name=FILE'
    .replace("BUCKET", params.BUCKET_NAME)
    .replace("FILE", encodeURIComponent(PATH));

  var response = UrlFetchApp.fetch(url, {
    method: "POST",
    contentLength: bytes.length,
    contentType: blob.getContentType(),
    payload: bytes,
    headers: {
      Authorization: 'Bearer ' + service.getAccessToken()
    }
  });

  var result = JSON.parse(response.getContentText());
  Logger.log(JSON.stringify(result, null, 2));
}

function getService() {
  return OAuth2.createService('ctrlq')
    .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
    .setTokenUrl('https://accounts.google.com/o/oauth2/token')
    .setClientId(params.CLIENT_ID)
    .setClientSecret(params.CLIENT_SECRET)
    .setCallbackFunction('authCallback')
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope('https://www.googleapis.com/auth/devstorage.read_write')
    .setParam('access_type', 'offline')
    .setParam('approval_prompt', 'force')
    .setParam('login_hint', Session.getEffectiveUser().getEmail());
}

function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Connected to Google Cloud Storage');
  } else {
    return HtmlService.createHtmlOutput('Access Denied');
  }
}