FROM node

WORKDIR /app

RUN ["mkdir", "videos"]

RUN [ "npm", "i", "-g", "typescript" ]

COPY package*.json ./

RUN [ "npm", "i" ]

COPY compile/ ./

CMD [ "npm", "run", "production" ]