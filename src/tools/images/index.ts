import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import API from '../../BraveAPI/index.js';
import { stringify } from '../../utils.js';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export const name = 'brave_image_search';

export const annotations: ToolAnnotations = {
  title: 'Brave Image Search',
  openWorldHint: true,
};

export const description = `
    Performs an image search using the Brave Search API. Helpful for when you need pictures of people, places, things, graphic design ideas, art inspiration, and more. When relaying results in a markdown environment, it may be helpful to include images in the results (e.g., ![image.title](image.properties.url)).
`;

export const execute = async (params: any) => {
  const response = await API.issueRequest<'images'>('images', params);

  return {
    content: response.results.map((imageResult) => {
      return {
        type: 'text' as const,
        text: stringify({
          title: imageResult.title,
          url: imageResult.url,
          page_fetched: imageResult.page_fetched,
          confidence: imageResult.confidence,
          properties: {
            url: imageResult.properties?.url,
            width: imageResult.properties?.width,
            height: imageResult.properties?.height,
          },
        }),
      };
    }),
  };
};

export const register = (mcpServer: McpServer) => {
  mcpServer.registerTool(
    name,
    {
      title: name,
      description: description,
      annotations: annotations,
    },
    execute
  );
};

export default {
  name,
  description,
  annotations,
  execute,
  register,
};
