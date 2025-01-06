document.addEventListener("alpine:init", () => {
  Alpine.data("global", () => ({
    isLoading: false,
    authUser: null,
    notifications: [],
    forCopy: null,
    forCopyFormat: null,

    init() {
      this.checkAndSetAuthUser();

      const forCopy = this.forCopy;
      const forCopyFormat = this.forCopyFormat;
      document.addEventListener("copy", function (evt) {
        evt.clipboardData.setData(forCopyFormat, forCopy);
        evt.preventDefault();
      });
    },
    checkAndSetAuthUser() {
      this.isLoading = true;
      return fetch("https://ui-paste-api.vercel.app/profile", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.authUser = data.data.user;
          return;
        })
        .catch((error) => {
          this.authUser = null;
          return;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    register(fullName, email, password, redirectTo = "/login") {
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Thanks for Joining Us!",
            description:
              "Please verify your email by clicking the link in the email we sent.",
          });
          window.location.href =
            redirectTo + "?email=" + encodeURIComponent(email);
        })
        .catch((error) => {
          if (error instanceof Response) {
            error
              .json()
              .then((jsonError) => {
                console.error("Error from API");
                console.error(jsonError);
                if ((error.status >= 400) & (error.status < 500)) {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to register",
                    description: jsonError.data.error,
                  });
                } else {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to register",
                    description: "Some mistake from our side",
                  });
                }
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to register",
                  description: "Some mistake from our side",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to register",
              description: "Some mistake from our side",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    resendEmail(email) {
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/auth/resend-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Verification email has been resent",
            description:
              "Please verify your email by clicking the link in the email we sent.",
          });
        })
        .catch((error) => {
          if (error instanceof Response) {
            error
              .json()
              .then((jsonError) => {
                console.error("Error from API");
                console.error(jsonError);
                if ((error.status >= 400) & (error.status < 500)) {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to resend",
                    description: jsonError.data.error,
                  });
                } else {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to resend",
                    description: "Some mistake from our side",
                  });
                }
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to resend",
                  description: "Some mistake from our side",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to resend",
              description: "Some mistake from our side",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    login(email, password) {
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          window.location.href = "/";
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                this.notifications.push({
                  type: "error",
                  title: "Failed to login",
                  description: "Please make sure your credential is correct.",
                });
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to login",
                  description: "Generic error from API",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to login",
              description: "Fetch error",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    requestResetPassword(email) {
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Password reset requested successfully",
            description: "We sent you an email for resetting your password",
          });
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                this.notifications.push({
                  type: "error",
                  title: "Failed to request passsword reset",
                  description: "Please make sure your input is correct.",
                });
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to request passsword reset",
                  description: "Generic error from API",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to request passsword reset",
              description: "Fetch error",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    resetPassword(newPassword, newPasswordConfirmation) {
      // Convert form data to JSON
      const urlParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = urlParams.get("access_token");
      const refreshToken = urlParams.get("refresh_token");

      if (newPassword !== newPasswordConfirmation) {
        this.notifications.push({
          type: "error",
          title: "Failed to update password",
          description:
            "Your password confirmation must be the same as the new password",
        });
        return;
      }

      // Use Fetch API to submit the form
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/auth/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          refreshToken,
          password: newPassword,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Password updated successfully",
            description: "You can login with the new password",
          });
        })
        .catch((error) => {
          if (typeof error.json === "function") {
            error
              .json()
              .then((jsonError) => {
                console.error("Json error from API");
                console.error(jsonError);
                this.notifications.push({
                  type: "error",
                  title: "Failed to update password",
                  description: jsonError.data.error,
                });
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to update password",
                  description: "Generic error from API",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to update password",
              description: "Fetch error",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    updateProfile(name, avatarUrl) {
      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          avatarUrl,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Profile updated successfully",
            description: "Your profile has been updated",
          });
        })
        .catch((error) => {
          if (error instanceof Response) {
            error
              .json()
              .then((jsonError) => {
                console.error("Error from API");
                console.error(jsonError);
                if ((error.status >= 400) & (error.status < 500)) {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to update the profile",
                    description: jsonError.data.error,
                  });
                } else {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to update the profile",
                    description: "Some mistake from our side",
                  });
                }
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to update the profile",
                  description: "Some mistake from our side",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to update the profile",
              description: "Some mistake from our side",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async uploadAvatar(event) {
      const file = event.target.files[0];
      if (!file) {
        console.error("No file selected.");
        return;
      }

      // Prepare the form data for the API request
      const formData = new FormData();
      formData.append("avatar", file);

      try {
        this.isLoading = true;
        const response = await fetch(
          "https://ui-paste-api.vercel.app/file/avatar",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        const result = await response.json();

        if (response.ok) {
          return result.data.url;
        } else {
          console.error("Error uploading avatar:", result.data.error);
          this.notifications.push({
            type: "error",
            title: "Failed to upload avatar",
            description: result.data.error,
          });
        }
      } catch (error) {
        console.error("Unexpected error occurred:", error);
        this.notifications.push({
          type: "error",
          title: "Failed to upload avatar",
          description: "Some mistake from our side",
        });
      } finally {
        this.isLoading = false;
      }
    },
    updatePassword(currentPassword, newPassword, newPasswordConfirmation) {
      if (newPassword !== newPasswordConfirmation) {
        this.notifications.push({
          type: "error",
          title: "Failed to update the password",
          description: "Password confirmation does not match",
        });
        return;
      }

      this.isLoading = true;
      fetch("https://ui-paste-api.vercel.app/profile/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: currentPassword,
          newPassword,
        }),
        credentials: "include",
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          return Promise.reject(response);
        })
        .then((data) => {
          this.notifications.push({
            type: "success",
            title: "Password updated successfully",
            description: "Your password has been updated",
          });
        })
        .catch((error) => {
          if (error instanceof Response) {
            error
              .json()
              .then((jsonError) => {
                console.error("Error from API");
                console.error(jsonError);
                if ((error.status >= 400) & (error.status < 500)) {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to update the password",
                    description: jsonError.data.error,
                  });
                } else {
                  this.notifications.push({
                    type: "error",
                    title: "Failed to update the password",
                    description: "Some mistake from our side",
                  });
                }
              })
              .catch((genericError) => {
                console.error("Generic error from API");
                console.error(error.statusText);
                this.notifications.push({
                  type: "error",
                  title: "Failed to update the password",
                  description: "Some mistake from our side",
                });
              });
          } else {
            console.log("Fetch error");
            console.log(error);
            this.notifications.push({
              type: "error",
              title: "Failed to update the password",
              description: "Some mistake from our side",
            });
          }
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    async getProductClipboard(platform, productCode) {
      try {
        this.isLoading = true;
        const res = await fetch(
          `https://ui-paste-api.vercel.app/clipboards/${platform}/${productCode}`,
          {
            credentials: "include",
          }
        );
        const json = await res.json();
        return json.data;
      } catch (error) {
        console.log(error);
        this.notifications.push({
          type: "error",
          title: "Failed to copy this component",
          description: "Some mistake from our side",
        });
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async copyFigma(productCode) {
      if (!this.authUser) {
        return;
      }

      if (productCode) {
        this.forCopy = await this.getProductClipboard("figma", productCode);
        if (this.forCopy) {
          this.forCopyFormat = "text/html";
          document.execCommand("copy");

          this.notifications.push({
            type: "success",
            title: "Success copy this component",
            description: "You can paste this component to your figma project",
          });
        }
      }
    },
    async copyWebflow(productCode) {
      if (!this.authUser) {
        return;
      }

      if (productCode) {
        this.forCopy = await this.getProductClipboard("webflow", productCode);
        if (this.forCopy) {
          this.forCopyFormat = "application/json";
          document.execCommand("copy");

          this.notifications.push({
            type: "success",
            title: "Success copy this component",
            description: "You can paste this component to your webflow project",
          });
        }
      }
    },
    async copyFramer(productCode) {
      if (!this.authUser) {
        return;
      }

      if (productCode) {
        this.forCopy = await this.getProductClipboard("framer", productCode);
        if (this.forCopy) {
          this.forCopyFormat = "text/html";
          document.execCommand("copy");

          this.notifications.push({
            type: "success",
            title: "Success copy this component",
            description: "You can paste this component to your framer project",
          });
        }
      }
    },
    getAndRedirectToSubscriptionPayment(lmsVariantId, redirectUrl) {
      if (lmsVariantId) {
        this.isLoading = true;
        fetch(
          `https://ui-paste-api.vercel.app/subscription/lmsqueezy/variants/${lmsVariantId}/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              redirectUrl,
            }),
            credentials: "include",
          }
        )
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            return Promise.reject(response);
          })
          .then((data) => {
            const paymentUrl = data.data.url;
            window.location = paymentUrl;
          })
          .catch((error) => {
            if (error instanceof Response) {
              error
                .json()
                .then((jsonError) => {
                  console.error("Error from API");
                  console.error(jsonError);
                  if ((error.status >= 400) & (error.status < 500)) {
                    this.notifications.push({
                      type: "error",
                      title: "Failed to create a subscription payment link",
                      description: jsonError.data.error,
                    });
                  } else {
                    this.notifications.push({
                      type: "error",
                      title: "Failed to create a subscription payment link",
                      description: "Some mistake from our side",
                    });
                  }
                })
                .catch((genericError) => {
                  console.error("Generic error from API");
                  console.error(error.statusText);
                  this.notifications.push({
                    type: "error",
                    title: "Failed to create a subscription payment link",
                    description: "Some mistake from our side",
                  });
                });
            } else {
              console.log("Fetch error");
              console.log(error);
              this.notifications.push({
                type: "error",
                title: "Failed to create a subscription payment link",
                description: "Some mistake from our side",
              });
            }
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
  }));
});
