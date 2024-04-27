import React, { memo, useCallback, useEffect, useState } from 'react'
import { Item, Dropdown, TextInput, Button, Box, Gap, ItemProps, ContextMenu, Page, StyleHTML, markdownToHTML, RichTextEditor } from '@avsync.live/formation'
import { pb } from 'redux-tk/pocketbase'
import { useHarmony_activeSpace } from 'redux-tk/harmony/hooks'
import { GroupSuggestions } from './Suggestions/GroupSuggestions'

export const Space = memo(() => {
  const space = useHarmony_activeSpace()

  const [edit, setEdit] = useState(false)

  const [name, setName] = useState(space?.name)
  const [description, setDescription] = useState(space?.description)

  useEffect(() => {
    setName(space?.name)
    setDescription(space?.description)
  }, [space])

  const handleDelete = async () => {
    try {
      await pb.collection('spaces').delete(space.id)
      console.log('Space deleted')
    } 
    catch (error) {
      console.error('Failed to delete space:', error)
      alert('Failed to delete space')
    }
  }

  const handleUpdate = async () => {
    try {
      await pb.collection('spaces').update(space.id, {
        name,
        description
      })
      setEdit(false)
      console.log('Space updated')
    } 
    catch (error) {
      console.error('Failed to update space:', error)
      alert('Failed to update space')
    }
  }

  const handleCancelEdit = useCallback(() => {
    setName(space.name)
    setDescription(space.description)
    setEdit(false)
  }, [space])

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      onClick: () => setEdit(true)
    },
    {
      icon: 'trash-alt',
      iconPrefix: 'fas',
      compact: true,
      text: 'Delete',
      onClick: handleDelete
    }
  ] as ItemProps[]

  return (
    <Page>
      <Box width='100%' py={.5}>
        {
            edit
              ? <Box width='100%' mt={.5}>
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
                      <RichTextEditor
                        outline
                        px={1}
                        placeholder='Description'
                        value={description}
                        onChange={val => setDescription(val)}
                      />
                    </Gap>
                    <Box width='var(--F_Input_Height)' wrap>
                      <Gap>
                        <Button
                          icon='save'
                          iconPrefix='fas'
                          square
                          onClick={handleUpdate}
                          compact
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
                    items: dropdownItems
                  }}
                >
                  <Item
                    pageTitle={edit ? 'Edit Space' : space?.name}
                    absoluteRightChildren
                    disablePadding
                  >
                    <Box height={'100%'}>
                      <Dropdown
                        icon='ellipsis-h'
                        iconPrefix='fas'
                        compact
                        square
                        minimal
                        items={dropdownItems}
                      />
                    </Box>
                  </Item>

                  <GroupSuggestions />

                  <StyleHTML>
                    <div dangerouslySetInnerHTML={{ __html: markdownToHTML(description || '') || '' }} />
                  </StyleHTML>
                </ContextMenu> 
        }
      </Box>
    </Page>
  )
})