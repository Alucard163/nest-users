import {INestApplication} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

export function setupSwagger(app: INestApplication) {
    const config = new DocumentBuilder()
        .setTitle('User Service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, doc);
}