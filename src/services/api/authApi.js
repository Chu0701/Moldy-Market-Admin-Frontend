import apiServer from "./api";

export const authApi = {
  //login user
  login: ({email, password}) => {
    return apiServer.post('/auth/login', {email, password},
      {
        headers: {
          'X-Moldy-Auth': '1',
        },
      },
    );
  },

  //refresh access token
  refreshToken: (refreshToken) => {
    return apiServer.post('/auth/refresh', {refreshToken});
  },

  //get my profile
  getMyProfile: () => {
    return apiServer.get('/users/me');
  },
}