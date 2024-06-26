import React, { useState, useEffect, memo, useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import {  useSpaces_activeChannelInfo, useSpaces_setActiveThreadId } from 'redux-tk/spaces/hooks'
import { Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, LineBreak, LoadingSpinner, TextInput, onScrollWheelClick, scrollToElementById, useDialog } from '@avsync.live/formation'
import { Message } from 'components/App/Message'
import { pb } from 'redux-tk/pocketbase'
import { generate_threadNameAndDescription } from 'language/generate/threadNameAndDescription'
import * as selectors from 'redux-tk/spaces/selectors'
import { store } from 'redux-tk/store'
import { JsonValidator } from 'utils/JSONValidator'
import { MessageSuggestions } from 'components/App/Suggestions/MessageSuggestions'
import { Count } from 'components/App/Count'
import { ConfirmationMessage } from 'components/Util/ConfirmationMessage'

interface Props {
  thread: any
  active: boolean
  index: number
  onToggle: (index: number) => void
  onReply: (id: string) => void
  expanded: boolean
}

export const Thread = memo(({ 
  thread, 
  active, 
  index,
  onToggle,
  onReply,
  expanded
}: Props) => {
  const setActiveThreadId = useSpaces_setActiveThreadId()
  const activeChannelInfo = useSpaces_activeChannelInfo()
  const [name, setName] = useState(thread?.name === 'New thread' ? '' : thread?.name)
  const [description, setDescription] = useState(thread?.description)
  const [edit, setEdit] = useState(false)
  const [loading, setLoading] = useState(false)

  const { openDialog } = useDialog()

  useEffect(() => {
    setName(thread?.name)
  }, [thread?.name])
  
  useEffect(() => {
    setDescription(thread?.description)
  }, [thread?.description])

  const jsonValidatorRef = useRef(new JsonValidator())

  const handleCancelEdit = useCallback(() => {
    setName(thread.name)
    setDescription(thread.description)
    setEdit(false)
  }, [thread.name, thread.description])

  const handleDelete = useCallback(async () => {
    try {
      await pb.collection('threads').delete(thread.id)
      setActiveThreadId(null)
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }, [thread.id, setActiveThreadId])
  
  const handleUpdate = useCallback(async () => {
    try {
      await pb.collection('threads').update(thread.id, {
        name,
        description
      })
      setEdit(false)
    } 
    catch (error) {
      console.error('Failed to update thread:', error)
      alert('Failed to update thread')
    }
  }, [thread.id, name, description])

  const toggleExpanded = useCallback(() => {
    onToggle(index)
  }, [index])

  const handleReply = useCallback(() => {
    setActiveThreadId(thread.id)
    onReply(thread.id)
  }, [thread.id])

  const dialog = () => {
    openDialog({
      mode: 'confirm',
      children: <ConfirmationMessage
        message='Are you sure you want to delete this thread?'
        name={thread?.name}
        warning={`${thread?.messageIds?.length} messages will also be deleted.`}
      />,
      callback: shouldDelete => { if (shouldDelete) handleDelete() }
    })
  }

  const dropdownItems = useMemo(() => [
    {
      icon: expanded ? 'chevron-up' : 'chevron-down',
      iconPrefix: 'fas',
      compact: true,
      text: expanded ? 'Collapse' : 'Expand',
      onClick: (e) => {
        e.stopPropagation()
        toggleExpanded()
      },
    },
    ...[
      {
        icon: 'circle-up',
        iconPrefix: 'fas',
        compact: true,
        text: 'Thread top',
        onClick: (e) => {
          e.stopPropagation()
          scrollToElementById(`thread_${thread.id}_top`, { behavior: 'smooth'})
        },
      },
      {
        icon: 'circle-down',
        iconPrefix: 'fas',
        compact: true,
        text: 'Thread bottom',
        onClick: (e) => {
          e.stopPropagation()
          scrollToElementById(`thread_${thread.id}_bottom`, { behavior: 'smooth'})
        },
      },
    ].filter(_ => expanded),
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: active ? 'times' : 'reply',
      iconPrefix: 'fas',
      compact: true,
      text: active ? 'Exit reply' : 'Reply',
      onClick: (e) => {
        e.stopPropagation()
        active
          ? setActiveThreadId(null)
          : handleReply()
      },
    },
    {
      icon: 'bolt-lightning',
      iconPrefix: 'fas',
      compact: true,
      text: 'Suggest',
      onClick: (e) => {
        e.stopPropagation()
        setLoading(true)
        const threadMessagesWithRole = selectors.selectThreadMessagesWithRole(thread.id)(store.getState())
        generate_threadNameAndDescription({
          prompt: JSON.stringify({
            channelName: activeChannelInfo?.name,
            description: activeChannelInfo?.description,
            threadMessagesWithRole
          }),
          enableEmoji: true,
          onComplete: async (text) => {
            const newName = JSON.parse(text).name
            const newDescription = JSON.parse(text).description
            try {
              await pb.collection('threads').update(thread.id, {
                name: newName,
                description: newDescription
              })
              setEdit(false)
            } 
            catch (error) {
              console.error('Failed to update thread:', error)
              alert('Failed to update thread')
            }
            setLoading(false)
          },
          onPartial: text => {
            setName(jsonValidatorRef.current.parseJsonProperty(text, 'name'))
            setDescription(jsonValidatorRef.current.parseJsonProperty(text, 'description'))
          }
        })
      }
    },
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: (e) => {
        e.stopPropagation()
        setEdit(true)
      },
    },
    {
      children: <LineBreak color='var(--F_Font_Color_Disabled)'/>
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: (e) => {
        e.stopPropagation()
        dialog()
      },
    },
  ], [expanded]) as ItemProps[]

  return (
    <S.Container active={active}>
      <div id={`thread_${thread.id}_top`} />
      {
        edit
          ? <Box ml={.5}>
              <Gap disableWrap>
                <Gap >
                  <TextInput
                    value={name}
                    onChange={val => setName(val)}
                    autoFocus
                    placeholder='Name'
                    onEnter={handleUpdate}
                    compact
                  />
                  <TextInput
                    value={description}
                    onChange={val => setDescription(val)}
                    placeholder='Description'
                    onEnter={handleUpdate}
                    compact
                  />
                </Gap>
                <Box width='var(--F_Input_Height)' wrap>
                  <Gap>
                    <Button
                      icon='check'
                      iconPrefix='fas'
                      square
                      onClick={handleUpdate}
                      compact
                      primary
                    />
                    <Button
                      icon='times'
                      iconPrefix='fas'
                      square
                      minimal
                      onClick={handleCancelEdit}
                      compact
                    />
                  </Gap>
                </Box>
              </Gap>
            </Box>
          : <ContextMenu
              dropdownProps={{
                items: dropdownItems,
                maxWidth: '10rem'
              }}
            >
              <Item
                headingText={name}
                subtitle={description}
                onClick={toggleExpanded}
                onMouseDown={onScrollWheelClick(() => dialog())}
              >
                {
                  loading && <LoadingSpinner compact />
                }
                <Count
                  count={thread?.messageIds?.length}
                />
                {
                  active 
                    ? <Button
                        icon='times'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveThreadId(null)
                        }}
                      />
                    : <Button
                        icon='reply'
                        iconPrefix='fas'
                        minimal
                        compact
                        square
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReply()
                        }}
                      />
                }
                <Dropdown
                  icon='ellipsis-h'
                  iconPrefix='fas'
                  compact
                  minimal
                  square
                  items={dropdownItems}
                  maxWidth='10rem'
                />
              </Item>
            </ContextMenu>
          }
      <S.Bottom />
      {
        expanded && 
          <>
            {
              thread.messageIds.map(id => (
                <Message 
                  id={id} 
                  key={id} 
                  expanded={expanded} 
                  onToggle={onToggle} 
                  index={index}
                  threadActive={active}
                  onHandleReply={handleReply}
                />
              ))
            }
            {
              active
                ? <MessageSuggestions />
                : <Box py={0.25} px={0.5}>
                    <Button expand text='Reply' onClick={handleReply} secondary />
                  </Box>
            }
          </>
      }
      <div id={`thread_${thread.id}`} />
      <div id={`thread_${thread.id}_bottom`} />
    </S.Container>
  )
})

const S = {
  Container: styled.div<{
    active: boolean
  }>`
    width: calc(100% - 4px);
    display: flex;
    flex-direction: column;
    border-left: ${(props) =>
      props.active
        ? '4px solid var(--F_Primary)'
        : '4px solid var(--F_Surface_0)'};
    border-radius: 0.125rem 0 0 0.125rem;
    margin: 0.25rem 0;
    padding: 0.25rem 0;
    border-bottom: 1px solid var(--F_Surface_0);
  `,
  Bottom: styled.div`
    width: 100%;
    height: 0.25rem;
  `,
}
