var authConfig = {
  version: "1.0.0",
  client_id: "",
  client_secret: "",
  refresh_token: "" // 授权 token
};

var gd;

var html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0,maximum-scale=1.0, user-scalable=no"
    />
    <title>创建Google TeamDrive</title>
    <link
      rel="stylesheet"
      href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
    />
    <script src="https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js"></script>

    <script
      src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
      integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
      integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
      crossorigin="anonymous"
    ></script>
  <!--源码地址: https://github.com/yyuueexxiinngg/some-scripts/blob/master/workers/google/drive/create-share-teamdrive.js-->
  </head>
  <body>
    <div id="app">
      <div id="container" class="container">
        <div class="row">
          <div class="col-sm-8 offset-sm-2 col-md-6 offset-md-3 text-center">
            <h1>创建Google TeamDrive</h1>
             <p>
              后端多个API请求, 过程耗时较长, 请耐心等待,
              <span style="color: red"><b>切勿重复提交</b></span>
            </p>
            <br />
            <div class="info-form text-left">
              <form id="teamDriveForm">
                <div class="form-group">
                  <label for="teamDriveName" class="sr-only">
                    TeamDrive 名称
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="teamDriveName"
                    placeholder="TeamDrive 名称"
                  />
                </div>
                <div class="form-group">
                  <label for="emailAddress" class="sr-only">
                    您的GMail邮箱地址
                  </label>
                  <input
                    type="email"
                    class="form-control"
                    id="emailAddress"
                    placeholder="您的GMail邮箱地址"
                  />
                </div>
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="customTheme"
                    value=""
                  />
                  <label class="form-check-label" for="customTheme">
                    自定TeamDrive主题头图
                  </label>
                </div>
                <div id="customThemeSection" class="d-none">
                  <div id="teamDriveThemePreview"></div>
                  <div id="teamDriveThemeOptions">
                    <div class="form-check">
                      <input
                        class="form-check-input"
                        type="radio"
                        name="teamDriveTheme"
                        id="teamDriveThemeOptionRandom"
                        value="random"
                        checked
                      />
                      <label
                        class="form-check-label"
                        for="teamDriveThemeOptionRandom"
                      >
                        随机
                      </label>
                    </div>
                  </div>
                </div>

                <button type="submit" class="btn btn-primary">Submit</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal fade"
      id="loadMe"
      tabindex="-1"
      role="dialog"
      aria-labelledby="loadMeLabel"
    >
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
          <div class="modal-body text-center">
            <div class="d-flex justify-content-center">
              <div class="spinner-border" role="status">
                <span class="sr-only">正在创建中...</span>
              </div>
            </div>
            <div clas="loader-txt">
              <p>正在创建中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <footer class="page-footer font-small blue">
      <div class="footer-copyright text-center py-3">
        © 2019 Copyright:
        <a
          href="https://github.com/yyuueexxiinngg/some-scripts/blob/master/workers/google/drive/create-share-teamdrive.js"
        >
          yyuueexxiinngg
        </a>
        <br />
        Special Thanks:
        <a href="https://github.com/donwa/goindex">
          donwa
        </a>
      </div>
    </footer>
  </body>

  <script>
    var teamDriveThemes;
    $("input[id=customTheme]").change(function() {
      if ($(this).is(":checked")) {
        $("#customThemeSection").removeClass("d-none");
      } else {
        $("#customThemeSection").addClass("d-none");
        $("input[name=teamDriveTheme]")[0].click();
      }
    });

    $.get("/teamDriveThemes", function(json) {
      teamDriveThemes = json.teamDriveThemes;
      $.each(json.teamDriveThemes, function(i, item) {
        $("#teamDriveThemeOptions").append(\`
        <div class="form-check">
           <input
            class="form-check-input"
            type="radio"
            name="teamDriveTheme"
            id="teamDriveThemeOption-\${item.id}"
            value="\${item.id}"
          />
          <label class="form-check-label" for="teamDriveThemeOption-\${item.id}">
           \${item.id}
          </label>
        </div>
        \`);
      });

      $("input[name=teamDriveTheme]").change(function() {
        var themeId = this.value;
        if (themeId === "random") {
          $("#teamDriveThemePreview").html("");
        } else {
          var theme = teamDriveThemes.find(function(t) {
            return t.id == themeId;
          });

          $("#teamDriveThemePreview").html(
            \`
          <div class="card" style="background-color: \${theme.colorRgb}">
            <img src="\${theme.backgroundImageLink}" class="card-img-top" alt="\${theme.id}" />
            <div class="card-body">
              <h5 class="card-text" style="color: white">
                \${theme.id}
              </h5>
            </div>
          </div>
      \`
          );
        }
      });

      $("#teamDriveForm").on("submit", function(event) {
        event.preventDefault();

        $("#loadMe").modal({
          backdrop: "static", //remove ability to close modal with click
          keyboard: false, //remove option to close with keyboard
          show: true //Display loader!
        });
        $.ajax({
          type: "POST",
          url: "/drive",
          data: JSON.stringify({
            teamDriveName: $("input[id=teamDriveName]").val(),
            teamDriveThemeId: $("input[name=teamDriveTheme]:checked").val(),
            emailAddress: $("input[id=emailAddress]").val()
          }), // or JSON.stringify ({name: 'jonas'}),
          success: function(data) {
            alert("成功!");
            $("#loadMe").modal("hide");
          },
          error: function(request, status, error) {
            alert(request.responseText);
            $("#loadMe").modal("hide");
          },
          contentType: "application/json",
          dataType: "json"
        });
      });
    });
  </script>
  <style type="text/css">
    .card-img-top {
      width: 100%;
      object-fit: cover;
    }
  </style>
</html>


`;

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Fetch and log a request
 * @param {Request} request
 */
async function handleRequest(request) {
  if (gd == undefined) {
    gd = new googleDrive(authConfig);
  }
  let url = new URL(request.url);
  let path = url.pathname;

  switch (path) {
    case "/teamDriveThemes":
      let teamDriveThemes = await gd.getTeamDriveThemes();
      return new Response(JSON.stringify(teamDriveThemes), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    case "/drive":
      if (request.method === "POST") {
        let result = await gd.createAndShareTeamDrive(request);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } else if (request.method === "OPTIONS") {
        return new Response("", {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        });
      } else {
        return new Response("Bad Request", {
          status: 400
        });
      }
    default:
      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });
  }
}
// https://stackoverflow.com/a/2117523
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    // tslint:disable-next-line:one-variable-per-declaration
    const r = (Math.random() * 16) | 0,
      // tslint:disable-next-line:triple-equals
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class googleDrive {
  constructor(authConfig) {
    this.authConfig = authConfig;
    this.accessToken();
  }

  async getTeamDriveThemes() {
    let url = "https://www.googleapis.com/drive/v3/about";
    let requestOption = await this.requestOption();
    let params = { fields: "teamDriveThemes" };
    url += "?" + this.enQuery(params);
    let response = await fetch(url, requestOption);
    return await response.json();
  }

  async createAndShareTeamDrive(request) {
    try {
      const requestBody = await request.json();

      // Create team drive
      console.log("Creating TeamDrive");
      let url = "https://www.googleapis.com/drive/v3/drives";
      let requestOption = await this.requestOption(
        { "Content-Type": "application/json" },
        "POST"
      );
      let params = { requestId: uuidv4() };
      url += "?" + this.enQuery(params);
      let post_data = {
        name: requestBody.teamDriveName
      };
      if (
        requestBody.teamDriveThemeId &&
        requestBody.teamDriveThemeId !== "random"
      ) {
        post_data.themeId = requestBody.teamDriveThemeId;
      }
      requestOption.body = JSON.stringify(post_data);
      let response = await fetch(url, requestOption);
      let result = await response.json();
      const teamDriveId = result.id;
      console.log("Created TeamDrive ID", teamDriveId);

      // Get created drive user permission ID
      console.log(`Getting creator permission ID`);
      url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions`;
      params = { supportsAllDrives: true };
      params.fields = "permissions(id,emailAddress)";
      url += "?" + this.enQuery(params);
      requestOption = await this.requestOption();
      response = await fetch(url, requestOption);
      result = await response.json();
      const currentUserPermissionID = result.permissions[0].id;
      console.log(currentUserPermissionID);

      // Share team drive with email address
      console.log(`Sharing the team drive to ${requestBody.emailAddress}`);
      url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions`;
      params = { supportsAllDrives: true };
      url += "?" + this.enQuery(params);
      requestOption = await this.requestOption(
        { "Content-Type": "application/json" },
        "POST"
      );
      post_data = {
        role: "organizer",
        type: "user",
        emailAddress: requestBody.emailAddress
      };
      requestOption.body = JSON.stringify(post_data);
      response = await fetch(url, requestOption);
      await response.json();

      // Delete creator from the team drive
      console.log("Deleting creator from the team drive");
      url = `https://www.googleapis.com/drive/v3/files/${teamDriveId}/permissions/${currentUserPermissionID}`;
      params = { supportsAllDrives: true };
      url += "?" + this.enQuery(params);
      requestOption = await this.requestOption({}, "DELETE");
      response = await fetch(url, requestOption);
      return await response.json();
    } catch (e) {
      return e;
    }
  }

  async accessToken() {
    console.log("accessToken");
    if (
      this.authConfig.expires == undefined ||
      this.authConfig.expires < Date.now()
    ) {
      const obj = await this.fetchAccessToken();
      if (obj.access_token != undefined) {
        this.authConfig.accessToken = obj.access_token;
        this.authConfig.expires = Date.now() + 3500 * 1000;
      }
    }
    return this.authConfig.accessToken;
  }

  async fetchAccessToken() {
    console.log("fetchAccessToken");
    const url = "https://www.googleapis.com/oauth2/v4/token";
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded"
    };
    const post_data = {
      client_id: this.authConfig.client_id,
      client_secret: this.authConfig.client_secret,
      refresh_token: this.authConfig.refresh_token,
      grant_type: "refresh_token"
    };

    let requestOption = {
      method: "POST",
      headers: headers,
      body: this.enQuery(post_data)
    };

    const response = await fetch(url, requestOption);
    return await response.json();
  }

  async requestOption(headers = {}, method = "GET") {
    const accessToken = await this.accessToken();
    headers["authorization"] = "Bearer " + accessToken;
    return { method: method, headers: headers };
  }

  enQuery(data) {
    const ret = [];
    for (let d in data) {
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    }
    return ret.join("&");
  }
}
