import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useHarmony_setActiveThreadId } from 'redux-tk/harmony/hooks'
import { Box, Button, ContextMenu, Dropdown, Gap, Item, ItemProps, RichTextEditor, TextInput, onScrollWheelClick } from '@avsync.live/formation'
import { Message } from './Message'
import { pb } from 'redux-tk/pocketbase'

export const Thread = ({ thread, active, onToggle, onReply }) => {
  const setActiveThreadId = useHarmony_setActiveThreadId()
  const [expanded, setExpanded] = useState(active)

  const [edit, setEdit] = useState(false)
  const [editName, setEditName] = useState(thread?.name === 'New thread' ? '' : thread?.name)
  const [editDescription, setEditDescription] = useState(thread?.description)

  const handleDelete = async () => {
    try {
      await pb.collection('threads').delete(thread.id)
      setActiveThreadId(null)
    } 
    catch (error) {
      console.error('Failed to delete message:', error)
      alert('Failed to delete message')
    }
  }

  const handleUpdate = async () => {
    try {
      await pb.collection('threads').update(thread.id, {
        name: editName,
        description: editDescription
      })
      setEdit(false)
    } catch (error) {
      console.error('Failed to update thread:', error)
      alert('Failed to update thread')
    }
  }

  useEffect(() => {
    setExpanded(active)
  }, [active])

  const toggleExpanded = () => {
    setExpanded(!expanded)
    onToggle()
  }

  const handleReply = () => {
    setActiveThreadId(thread.id)
    onReply()
  }

  const dropdownItems = [
    {
      icon: 'reply',
      iconPrefix: 'fas',
      compact: true,
      text: 'Reply',
      onClick: (e) => {
        e.stopPropagation()
        handleReply()
      },
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
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: (e) => {
        e.stopPropagation()
        handleDelete()
      },
    },
  ] as ItemProps[]

  return (
    <S.Container active={active}>
      {
        edit
          ? <Box ml={.5}>
              <Gap disableWrap>
                <Gap >
                  <TextInput
                    value={editName}
                    onChange={val => setEditName(val)}
                    autoFocus
                    placeholder='Name'
                    onEnter={handleUpdate}
                    compact
                  />
                  <TextInput
                    value={editDescription}
                    onChange={val => setEditDescription(val)}
                    placeholder='Description'
                    onEnter={handleUpdate}
                    compact
                  />
                </Gap>
                <Box width='var(--F_Input_Height)' wrap>
                  <Gap>
                    <Button
                      icon='save'
                      iconPrefix='fas'
                      square
                      onClick={() => handleUpdate()}
                      compact
                    />
                    <Button
                      icon='times'
                      iconPrefix='fas'
                      square
                      minimal
                      onClick={() => setEdit(false)}
                      compact
                    />
                  </Gap>
                </Box>
              </Gap>
            </Box>
          : <ContextMenu
              dropdownProps={{
                items: dropdownItems
              }}
            >
              <Item
                headingText={thread?.name}
                subtitle={thread?.description}
                onClick={toggleExpanded}
                onMouseDown={onScrollWheelClick(() => handleDelete())}
              >
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
                />
              </Item>
            </ContextMenu>
          }
      
      <S.Bottom />
      {
      expanded && 
        <>
          {
            thread.messages.map(message => (
              <Message message={message} key={message.id} />
            ))
          }
          {
            !active && 
              <Box py={0.25} px={0.5}>
                <Button expand text='Reply' onClick={handleReply} secondary />
              </Box>
          }
        </>
      }
      <div id={`thread_${thread.id}`} />
    </S.Container>
  )
}

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
