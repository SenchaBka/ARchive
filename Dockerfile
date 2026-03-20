FROM node:20-alpine

ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=password

RUN mkdir -p /home/app
WORKDIR /home/app

COPY package*.json ./
RUN npm install

COPY . .

#ENV NEXT_EXPERIMENTAL_TURBOPACK=false
#EXPOSE 3000

#CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

RUN npm run build
CMD ["npm", "start"]