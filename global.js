const states = {
  isLoading: false,
  loadingLayer: $(".loading-layer"),
  notificationSuccess: $(".notification-success"),
  notificationError: $(".notification-error"),
  authUser: null,
  forCopy: null,
  forCopyFormat: null,
};
const methods = {
  async handleAllAuthDependentViews(isAuth) {
    if (isAuth) {
      $("[uipaste-action='auth-only']").show();
      $("[uipaste-action='guest-only']").hide();
    } else {
      $("[uipaste-action='auth-only']").hide();
      $("[uipaste-action='guest-only']").show();
    }
  },
  async checkAndSetAuthUser() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      states.authUser = null;
      localStorage.removeItem("access_token");
      methods.handleAllAuthDependentViews(false);
      return;
    }
    return fetch("https://ui-paste-api.vercel.app/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then((data) => {
        states.authUser = data.data.user;
        methods.handleAllAuthDependentViews(true);
        return;
      })
      .catch((error) => {
        states.authUser = null;
        localStorage.removeItem("access_token");
        methods.handleAllAuthDependentViews(false);
        return;
      });
  },
  storeTokenToLocalStorage(token) {
    localStorage.setItem("access_token", token);
  },
  setLoading(newIsLoading) {
    states.isLoading = newIsLoading;
    if (states.isLoading) {
      states.loadingLayer.appendTo(document.body);
      $(".loading-layer").css("display", "flex");
    } else {
      $(".loading-layer").remove();
    }
  },
  showSuccessMessage(title, message) {
    states.notificationSuccess.appendTo(document.body);
    $(".notification-success").css("display", "flex");
    $(".notification-success").find(".notification-success-title").html(title);
    $(".notification-success")
      .find(".notification-success-message")
      .html(message);
    $(".notification-success")
      .find(".notification-success-close")
      .click(function () {
        $(".notification-success")?.remove();
      });
    $(".notification-success")
      .delay(5000)
      .fadeOut(1000, () => {
        $(".notification-success")?.remove();
      });
  },
  showErrorMessage(title, message) {
    states.notificationError.appendTo(document.body);
    $(".notification-error").css("display", "flex");
    $(".notification-error").find(".notification-error-title").html(title);
    $(".notification-error").find(".notification-error-message").html(message);
    $(".notification-error")
      .find(".notification-error-close")
      .click(function () {
        $(".notification-error")?.remove();
      });
    $(".notification-error")
      .delay(5000)
      .fadeOut(1000, () => {
        $(".notification-error").remove();
      });
  },
  handleLoop() {
    $("[uipaste-action=loop]").each(function (index) {
      const loopData = $(this).attr("uipaste-loop");
      splittedData = loopData.split(",");
      splittedData.forEach((item) => {
        template = $(this).clone();
        target = template.find('[uipaste-action="loop-target"]').html(item);
        template.insertBefore($(this));
      });
      $(this).remove();
    });
  },
  handleRegisterSubmit() {
    $(".uipaste-register-form").submit(function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Convert form data to JSON
      const formData = new FormData(this);

      // Use Fetch API to submit the form
      methods.setLoading(true);
      fetch("https://ui-paste-api.vercel.app/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          $(".uipaste-register-form")[0].reset();
          methods.showSuccessMessage(
            "Thanks for Joining Us!",
            "We will let you know the update to your email."
          );
        })
        .catch((error) => {
          if (error instanceof Response) {
            error
              .json()
              .then((jsonError) => {
                console.error("Error from API");
                console.error(jsonError);
                if ((error.status >= 400) & (error.status < 500)) {
                  methods.showErrorMessage(
                    "Failed to save to waiting list",
                    jsonError.data.error
                  );
                } else {
                  methods.showErrorMessage(
                    "Failed to save to waiting list",
                    "Some mistake from our side"
                  );
                }
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                methods.showErrorMessage(
                  "Failed to save to waiting list",
                  "Some mistake from our side"
                );
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            methods.showErrorMessage(
              "Failed to save to waiting list",
              "Some mistake from our side"
            );
          }
        })
        .finally(() => {
          methods.setLoading(false);
        });
    });
  },
  handleLoginSubmit() {
    $(".uipaste-login-form").submit(function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Convert form data to JSON
      const formData = new FormData(this);

      // Use Fetch API to submit the form
      methods.setLoading(true);
      fetch("https://ui-paste-api.vercel.app/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          $(".uipaste-login-form")[0].reset();
          methods.storeTokenToLocalStorage(data.data.token);
          window.location.href = "/";
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                methods.showErrorMessage(
                  "Failed to login",
                  "Please make sure your credential is correct."
                );
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                methods.showErrorMessage(
                  "Failed to login",
                  "Generic error from API"
                );
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            methods.showErrorMessage("Failed to login", "Fetch error");
          }
        })
        .finally(() => {
          methods.setLoading(false);
        });
    });
  },
  handleForgotPasswordSubmit() {
    $(".uipaste-forgot-password-form").submit(function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Convert form data to JSON
      const formData = new FormData(this);

      // Use Fetch API to submit the form
      methods.setLoading(true);
      fetch("https://ui-paste-api.vercel.app/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          $(".uipaste-forgot-password-form")[0].reset();
          methods.showSuccessMessage(
            "Password reset requested successfully",
            "We sent you an email for resetting your password"
          );
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                methods.showErrorMessage(
                  "Failed to request passsword reset",
                  "Please make sure your input is correct."
                );
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                methods.showErrorMessage(
                  "Failed to request passsword reset",
                  "Generic error from API"
                );
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            methods.showErrorMessage(
              "Failed to request passsword reset",
              "Fetch error"
            );
          }
        })
        .finally(() => {
          methods.setLoading(false);
        });
    });
  },
  handleUpdatePasswordSubmit() {
    $(".uipaste-update-password-form").submit(function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Convert form data to JSON
      const formData = new FormData(this);
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");
      formData.append("accessToken", accessToken);
      formData.append("refreshToken", refreshToken);

      if (formData.get("password") !== formData.get("passwordConfirmation")) {
        methods.showErrorMessage(
          "Failed to update password",
          "Your password confirmation must be the same as the new password"
        );
        return;
      }

      // Use Fetch API to submit the form
      methods.setLoading(true);
      fetch("https://ui-paste-api.vercel.app/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          $(".uipaste-update-password-form")[0].reset();
          methods.showSuccessMessage(
            "Password updated successfully",
            "You can login with the new password"
          );
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                methods.showErrorMessage(
                  "Failed to update password",
                  jsonError.data.error
                );
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                methods.showErrorMessage(
                  "Failed to update password",
                  "Generic error from API"
                );
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            methods.showErrorMessage(
              "Failed to update password",
              "Fetch error"
            );
          }
        })
        .finally(() => {
          methods.setLoading(false);
        });
    });
  },
  async getFigmaClipboard(productCode) {
    try {
      methods.setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("token not found");
        return null;
      }

      const res = await fetch(
        "https://ui-paste-api.vercel.app/figma-clipboards/" + productCode,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const json = await res.json();
      methods.showSuccessMessage(
        "Success copy this component",
        "You can paste this component to your figma project"
      );
      return json.data;
    } catch (error) {
      console.log(error);
      methods.showErrorMessage(
        "Failed to copy this component",
        "Some mistake from our side"
      );
      return null;
    } finally {
      methods.setLoading(false);
    }
  },
  async getWebflowClipboard(productCode) {
    try {
      methods.setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("token not found");
        return null;
      }

      const res = await fetch(
        "https://ui-paste-api.vercel.app/webflow-clipboards/" + productCode,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const json = await res.json();
      methods.showSuccessMessage(
        "Success copy this component",
        "You can paste this component to your webflow project"
      );
      return json.data;
    } catch (error) {
      console.log(error);
      methods.showErrorMessage(
        "Failed to copy this component",
        "Some mistake from our side"
      );
      return null;
    } finally {
      methods.setLoading(false);
    }
  },
  async getFramerClipboard(productCode) {
    try {
      methods.setLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("token not found");
        return null;
      }

      const res = await fetch(
        "https://ui-paste-api.vercel.app/framer-clipboards/" + productCode,
        {
          headers: { Authorization: "Bearer " + token },
        }
      );
      const json = await res.json();
      methods.showSuccessMessage(
        "Success copy this component",
        "You can paste this component to your framer project"
      );
      return json.data;
    } catch (error) {
      console.log(error);
      methods.showErrorMessage(
        "Failed to copy this component",
        "Some mistake from our side"
      );
      return null;
    } finally {
      methods.setLoading(false);
    }
  },
  addListenerToCopyButtons() {
    $(document).on("click", "[uipaste-action='copy-figma']", async function () {
      if (!states.authUser) {
        return;
      }

      const productCode = $(this).attr("uipaste-product-code");

      if (productCode) {
        states.forCopy = await methods.getFigmaClipboard(productCode);
        if (states.forCopy) {
          states.forCopyFormat = "text/html";
          document.execCommand("copy");
        }
      }
    });

    $(document).on(
      "click",
      "[uipaste-action='copy-webflow']",
      async function () {
        if (!states.authUser) {
          return;
        }

        const productCode = $(this).attr("uipaste-product-code");

        if (productCode) {
          states.forCopy = await methods.getWebflowClipboard(productCode);
          if (states.forCopy) {
            states.forCopyFormat = "application/json";
            document.execCommand("copy");
          }
        }
      }
    );

    $(document).on(
      "click",
      "[uipaste-action='copy-framer']",
      async function () {
        if (!states.authUser) {
          return;
        }

        const productCode = $(this).attr("uipaste-product-code");

        if (productCode) {
          states.forCopy = await methods.getFramerClipboard(productCode);
          if (states.forCopy) {
            states.forCopyFormat = "text/html";
            document.execCommand("copy");
          }
        }
      }
    );

    document.addEventListener("copy", function (evt) {
      evt.clipboardData.setData(states.forCopyFormat, states.forCopy);
      evt.preventDefault();
    });
  },
};
const onMounted = () => {
  methods.checkAndSetAuthUser();
  methods.handleLoop();
  methods.handleLoginSubmit();
  methods.handleRegisterSubmit();
  methods.handleForgotPasswordSubmit();
  methods.handleUpdatePasswordSubmit();
  methods.addListenerToCopyButtons();
};
onMounted();
