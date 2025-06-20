// src/opensearch/opensearch.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';

@Injectable()
export class OpenSearchService implements OnModuleInit {
  private client: Client;

  constructor(private readonly config: ConfigService) {
    this.client = new Client({
      node: this.config.get('OPENSEARCH_URL'),
      auth: {
        username: this.config.get('OPENSEARCH_USER'), // Only for self-hosted or basic auth
        password: this.config.get('OPENSEARCH_PASS'),
      },
      // For AWS SigV4 (optional): use aws4 + custom transport if needed
      // leave out `auth` if you're using IAM roles (see bottom note)
    });
  }

  async onModuleInit() {
    // Optionally create index if it doesn't exist
    const indexExists = await this.client.indices.exists({
      index: 'documents',
    });
    console.log(indexExists);

    if (!indexExists.body) {
      await this.client.indices.create({
        index: 'documents',
        body: {
          mappings: {
            properties: {
              userEmail: { type: 'keyword' },
              filename: { type: 'keyword' },
              text: { type: 'text' },
              uploadedAt: { type: 'date' },
            },
          },
        },
      });
    }
  }

  async indexDocument(document: {
    id: string;
    filename: string;
    text: string;
    userEmail: string;
    uploadedAt: string;
  }) {
    return this.client.index({
      index: 'documents',
      id: document.id,
      body: document,
    });
  }

  async searchByText(query: string, userEmail: string) {
    const result = await this.client.search({
      index: 'documents',
      body: {
        query: {
          bool: {
            must: [
              {
                match: {
                  text: {
                    query,
                    fuzziness: 'AUTO',
                  },
                },
              },
            ],
            filter: [
              {
                term: {
                  userEmail: userEmail,
                },
              },
            ],
          },
        },
        highlight: {
          fields: {
            text: {},
          },
          fragment_size: 100,
        },
      },
    });
    return result.body.hits.hits.map((hit: any) => ({
      id: hit._id,
      filename: hit._source.filename,
      uploadedAt: hit._source.uploadedAt,
      snippets: hit.highlight?.text ?? [],
    }));
  }
}
