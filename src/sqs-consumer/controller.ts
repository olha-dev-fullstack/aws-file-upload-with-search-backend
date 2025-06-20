import { Controller, Post } from '@nestjs/common';
import { ConsumerService } from './consumer.service';

@Controller()
export class TestController {
  constructor(private service: ConsumerService) {}
  @Post('/test/sqs')
  async test() {
    const message = {
      Body: '{"Records":[{"s3":{"object":{"key":"files/olha.shevel.dev@gmail.com/1750326759747_Developer Requirements En.pdf"}}}]}',
    };

    await this.service.handleMessage(message);
  }
}
