import { Box, Button, Item, TextInput } from '@avsync.live/formation'
import { generate_channels } from 'language/generate/channels'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHarmony_activeChannel, useHarmony_activeGroupChannelNamesAndDescriptions, useHarmony_activeGroup, useHarmony_activeSpace, useHarmony_setActiveThreadId, useHarmony_currentUserId, useHarmony_activeGroupId } from 'redux-tk/harmony/hooks'
import { pb } from 'redux-tk/pocketbase'
import { JsonValidator } from 'utils/JSONValidator'

export const ChannelSuggestions = () => {
  const navigate = useNavigate()

  const activeSpace = useHarmony_activeSpace()
  const activeGroup = useHarmony_activeGroup()
  const activeChannel = useHarmony_activeChannel()
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const activeGroupChannelNamesAndDescriptions = useHarmony_activeGroupChannelNamesAndDescriptions()
  const userId = useHarmony_currentUserId()
  const groupId = useHarmony_activeGroupId()

  const [feedback, setFeedback] = useState('')

  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    setSuggestions([])
  }, [activeChannel])

  const jsonValidatorRef = useRef(new JsonValidator())

  const onSuggest = () => {
    setSuggestions([])
    setFeedback('')
    generate_channels({
      prompt: `
        Space name: ${activeSpace?.name}
        Space description: ${activeSpace?.description}
        Group name: ${activeGroup?.name}
        Group description: ${activeGroup?.description}

        Existing channels: \n${activeGroupChannelNamesAndDescriptions}
        Your previous suggestions (optional): ${suggestions}
        User feedback (optional): ${feedback}
      `,
      enableEmoji: true,
      onComplete: async (text) => {
        setSuggestions(JSON.parse(text)?.suggestions)
      },
      onPartial: text => {
        // @ts-ignore
        setSuggestions(jsonValidatorRef.current.parseJsonProperty(text, 'suggestions'))
      }
    })
  }

  const handleCreateGroup = async ({ name, description }: { name: string, description: string }) => {
    if (!userId || !groupId) return
    const data = { name: name, description, userid: userId, groupid: groupId }
    try {
      const response = await pb.collection('channels').create(data)
      navigate(`/spaces/${activeSpace.id}/groups/${groupId}/channels/${response.id}`)
    } 
    catch (error) {
      console.error('Failed to create channel:', error)
      alert('Error creating channel. Check console for details.')
    }
  }

  return (
    <Box wrap width={'100%'}>
      <Box wrap width={'100%'}>
        {
          suggestions?.map(({ name, description }) =>
            <Item
              key={name}
              iconPrefix='fas'
              text={name}
              subtitle={description}
              onClick={() => {
                setActiveThreadId('')
                handleCreateGroup({ name, description })
                setSuggestions([])
              }}
            />
          )
        }
      </Box>
      <Box width={'100%'} mb={.5} mt={suggestions?.length > 0 ? .5 : 0}>
        <TextInput
          value={feedback}
          onChange={val => setFeedback(val)}
          placeholder='Suggest new channels'
          hideOutline
          compact
          onEnter={onSuggest}
        />
        <Button
          text='Suggest'
          icon='bolt-lightning'
          iconPrefix='fas'
          secondary
          compact
          onClick={onSuggest}
        />
      </Box>
    </Box>
   
  )
}