FROM node:16.13.1
MAINTAINER gordon-hj <thepalry@naver.com>

RUN mkdir -p /app
WORKDIR /app
ADD . /app
RUN npm install

EXPOSE 8080
CMD npm start $APP_ENV