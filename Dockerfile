FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY ./dist /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE 9090


