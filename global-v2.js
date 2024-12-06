document.addEventListener('alpine:init', () => {
    Alpine.data('global', () => ({
        isLoading: false,
        authUser: null,
        notifications: [],
        forCopy: null,
        forCopyFormat: null,

        init() {
            this.checkAndSetAuthUser();

            const forCopy = this.forCopy;
            const forCopyFormat = this.forCopyFormat
            document.addEventListener("copy", function (evt) {
                evt.clipboardData.setData(forCopyFormat, forCopy);
                evt.preventDefault();
            });
        },
        checkAndSetAuthUser() {
            const token = localStorage.getItem("access_token");
            if (!token) {
                this.authUser = null;
                localStorage.removeItem("access_token");
                return;
            }

            this.isLoading = true;
            return fetch("https://ui-paste-api.vercel.app/profile", {
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
                    this.authUser = data.data.user;
                    return;
                })
                .catch((error) => {
                    this.authUser = null;
                    localStorage.removeItem("access_token");
                    return;
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        register(fullName, email, password) {
            this.isLoading = true
            fetch("https://ui-paste-api.vercel.app/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName,
                    email,
                    password
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(response);
                })
                .then((data) => {
                    this.notifications.push({
                        type: 'success',
                        title: 'Thanks for Joining Us!',
                        description: 'Please verify your email by clicking the link in the email we sent.'
                    });
                    window.location.href = '/login';
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
                                        type: 'error',
                                        title: 'Failed to register',
                                        description: jsonError.data.error
                                    });
                                } else {
                                    this.notifications.push({
                                        type: 'error',
                                        title: 'Failed to register',
                                        description: "Some mistake from our side"
                                    });
                                }
                            })
                            .catch((genericError) => {
                                console.error("Generic error from API");
                                console.error(error.statusText);
                                this.notifications.push({
                                    type: 'error',
                                    title: 'Failed to register',
                                    description: "Some mistake from our side"
                                });
                            });
                    } else {
                        console.log("Fetch error");
                        console.log(error);
                        this.notifications.push({
                            type: 'error',
                            title: 'Failed to register',
                            description: "Some mistake from our side"
                        });
                    }
                })
                .finally(() => {
                    this.isLoading = false
                });
        },
        login(email, password) {
            this.isLoading = true
            fetch("https://ui-paste-api.vercel.app/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(response);
                })
                .then((data) => {
                    localStorage.setItem('access_token', data.data.token);
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
                                    type: 'error',
                                    title: 'Failed to login',
                                    description: "Please make sure your credential is correct."
                                });
                            })
                            .catch((genericError) => {
                                console.error("Generic error from API");
                                console.error(error.statusText);
                                this.notifications.push({
                                    type: 'error',
                                    title: 'Failed to login',
                                    description: "Generic error from API"
                                });
                            });
                    } else {
                        console.log("Fetch error");
                        console.log(error);
                        this.notifications.push({
                            type: 'error',
                            title: 'Failed to login',
                            description: "Fetch error"
                        });
                    }
                })
                .finally(() => {
                    this.isLoading = false
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
                    email
                }),
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(response);
                })
                .then((data) => {
                    this.notifications.push({
                        type: 'success',
                        title: "Password reset requested successfully",
                        description: "We sent you an email for resetting your password"
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
                                    type: 'error',
                                    title: "Failed to request passsword reset",
                                    description: "Please make sure your input is correct."
                                });
                            })
                            .catch((genericError) => {
                                console.error("Generic error from API");
                                console.error(error.statusText);
                                this.notifications.push({
                                    type: 'error',
                                    title: "Failed to request passsword reset",
                                    description: "Generic error from API"
                                });
                            });
                    } else {
                        console.log("Fetch error");
                        console.log(error);
                        this.notifications.push({
                            type: 'error',
                            title: "Failed to request passsword reset",
                            description: "Fetch error"
                        });
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        resetPassword(newPassword, newPasswordConfirmation) {
            // Convert form data to JSON
            const formData = new FormData(this);
            const urlParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = urlParams.get("access_token");
            const refreshToken = urlParams.get("refresh_token");
            formData.append("accessToken", accessToken);
            formData.append("refreshToken", refreshToken);
            formData.append("password", newPassword);

            if (newPassword !== newPasswordConfirmation) {
                this.notifications.push({
                    type: 'error',
                    title: "Failed to update password",
                    description: "Your password confirmation must be the same as the new password"
                });
                return;
            }

            // Use Fetch API to submit the form
            methods.setLoading(true);
            fetch("https://ui-paste-api.vercel.app/auth/update-password", {
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
                    this.notifications.push({
                        type: 'success',
                        title: "Password updated successfully",
                        description: "You can login with the new password"
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
                                    type: 'error',
                                    title: "Failed to update password",
                                    description: jsonError.data.error
                                });
                            })
                            .catch((genericError) => {
                                console.error("Generic error from API");
                                console.error(error.statusText);
                                this.notifications.push({
                                    type: 'error',
                                    title: "Failed to update password",
                                    description: "Generic error from API"
                                });
                            });
                    } else {
                        console.log("Fetch error");
                        console.log(error);
                        this.notifications.push({
                            type: 'error',
                            title: "Failed to update password",
                            description: "Fetch error"
                        });
                    }
                })
                .finally(() => {
                    this.isLoading = false;
                });
        },
        async getProductClipboard(platform, productCode) {
            try {
                this.isLoading = true
                const token = localStorage.getItem("access_token");
                if (!token) {
                    console.error("token not found");
                    return null;
                }

                const res = await fetch(
                    `https://ui-paste-api.vercel.app/clipboards/${platform}/${productCode}`,
                    {
                        headers: { Authorization: "Bearer " + token },
                    }
                );
                const json = await res.json();
                return json.data;
            } catch (error) {
                console.log(error);
                this.notifications.push({
                    type: 'error',
                    title: 'Failed to copy this component',
                    description: "Some mistake from our side"
                });
                return null;
            } finally {
                this.isLoading = false
            }
        },
        async copyFigma(productCode) {
            if (!this.authUser) {
                return;
            }

            if (productCode) {
                this.forCopy = await this.getProductClipboard('figma', productCode);
                if (this.forCopy) {
                    this.forCopyFormat = "text/html";
                    document.execCommand("copy");

                    this.notifications.push({
                        type: 'success',
                        title: "Success copy this component",
                        description: "You can paste this component to your figma project"
                    });
                }
            }
        },
        async copyWebflow(productCode) {
            if (!this.authUser) {
                return;
            }

            if (productCode) {
                this.forCopy = await this.getProductClipboard('webflow', productCode);
                if (this.forCopy) {
                    this.forCopyFormat = "application/json";
                    document.execCommand("copy");

                    this.notifications.push({
                        type: 'success',
                        title: "Success copy this component",
                        description: "You can paste this component to your webflow project"
                    });
                }
            }
        },
        async copyFramer(productCode) {
            if (!this.authUser) {
                return;
            }

            if (productCode) {
                this.forCopy = await this.getProductClipboard('framer', productCode);
                if (this.forCopy) {
                    this.forCopyFormat = "text/html";
                    document.execCommand("copy");

                    this.notifications.push({
                        type: 'success',
                        title: "Success copy this component",
                        description: "You can paste this component to your framer project"
                    });
                }
            }
        },
        getAndRedirectToSubscriptionPayment(lmsVariantId, redirectUrl) {
            const token = localStorage.getItem("access_token");
            if (!token) {
                console.error("token not found");
                return null;
            }

            if (lmsVariantId) {
                this.isLoading = true;
                fetch(`https://ui-paste-api.vercel.app/subscription/lmsqueezy/variants/${lmsVariantId}/subscribe`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token
                    },
                    body: JSON.stringify({
                        redirectUrl
                    })
                })
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
                                            type: 'error',
                                            title: "Failed to create a subscription payment link",
                                            description: jsonError.data.error
                                        });
                                    } else {
                                        this.notifications.push({
                                            type: 'error',
                                            title: "Failed to create a subscription payment link",
                                            description: "Some mistake from our side"
                                        });
                                    }
                                })
                                .catch((genericError) => {
                                    console.error("Generic error from API");
                                    console.error(error.statusText);
                                    this.notifications.push({
                                        type: 'error',
                                        title: "Failed to create a subscription payment link",
                                        description: "Some mistake from our side"
                                    });
                                });
                        } else {
                            console.log("Fetch error");
                            console.log(error);
                            this.notifications.push({
                                type: 'error',
                                title: "Failed to create a subscription payment link",
                                description: "Some mistake from our side"
                            });
                        }
                    })
                    .finally(() => {
                        this.isLoading = false;
                    });
            }
        }
    }));
});