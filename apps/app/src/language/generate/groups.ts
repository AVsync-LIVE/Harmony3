import { chat } from 'language/chat'
import { selectActiveSpaceId } from 'redux-tk/spaces/selectors'
import { store } from 'redux-tk/store'

export const generate_groups = ({
  prompt,
  enableEmoji,
  onComplete,
  onPartial
}: {
  prompt: string,
  enableEmoji: boolean,
  onComplete: (text: string) => void,
  onPartial: (text: string) => void
}) => {
  const activeSpaceId = selectActiveSpaceId(store.getState())
  chat({
    retrieve: true,
    spaceId: activeSpaceId,
    messages: [
      {
        role: 'system',
        content: `You are an API endpoint that provides a list of group suggestions based on a prompt. Each suggestion consists of a name and a brief description, reflecting the group's intended purpose.
        ${enableEmoji ? 'Names start with an emoji. ' : ''}
        Answer in the following JSON format:

        REMEMBER: these are EXAMPLE suggestions, the real suggestions should be completely unique and tailored to the prompt.
        {
          "suggestions": [
            {
              "name": "${enableEmoji ? '🌟 ': ''}Leadership Lounge",
              "description": "A space for emerging leaders to share insights and grow together."
            },
            {
              "name": "${enableEmoji ? '🔧 ': ''}Tech Toolbox",
              "description": "Discuss the latest in tech tools, tips, and trends."
            },
            {
              "name": "${enableEmoji ? '🌱 ': ''}Green Thumbs",
              "description": "Connect with gardening enthusiasts to exchange tips and tricks for a greener thumb."
            },
            {
              "name": "${enableEmoji ? '🎭 ': ''}Drama Club",
              "description": "A group for theatre aficionados to discuss plays, performances, and techniques."
            },
            {
              "name": "${enableEmoji ? '📖 ': ''}Literature Lovers",
              "description": "Join fellow bookworms to explore literary works from around the globe."
            }
          ]
        }
        
        Prioritize the space description. Groups should always be related to the space name and description.

        Avoid suggesting groups which are too similar to existing groups in the space.

        All suggested groups must be ENTIRELY NEW, not already existing in the space.

        If user feedback is provided, it must be prioritized. Answer in as a valid JSON object, no extra commentary, only the object. Ensure each key is wrapped in double quotes to conform to the JSON specification.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    onPartial: response => {
      onPartial(response)
    },
    onComplete: response => {
      onComplete(response)
    }
  })
}
