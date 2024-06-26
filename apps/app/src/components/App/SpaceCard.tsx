import { Box, Spacer, AspectRatio, Gap, Item, Dropdown, ContextMenu, ItemProps } from '@avsync.live/formation'
import React from 'react'
import styled from 'styled-components'
import { Counts } from 'components/App/Counts'
import { useSpaces_countById } from 'redux-tk/spaces/hooks'

interface Props {
  id: string
  previewSrc?: string
  name?: string
  children?: React.ReactNode
  expandVertical?: boolean
}

export const SpaceCard = React.memo(({ 
  id,
  previewSrc,
  name, 
  children,
  expandVertical
}: Props) => {
  const SpaceName = React.memo(() => (<S.SpaceName>
    <Box>
      <Item pageTitle={name}>
        { children }
      </Item>
    </Box>
  </S.SpaceName>))

  const dropdownItems = [
    {
      icon: 'edit',
      iconPrefix: 'fas',
      compact: true,
      text: 'Edit',
      href: `/spaces/${id}?edit=true`
    },
  ] as ItemProps[]

  const count = useSpaces_countById(id)

  return (
    <AspectRatio
      ratio={3/1}
    >
    <ContextMenu
      dropdownProps={{
        items: dropdownItems
      }}
    >
      <S.SpaceCard expandVertical={expandVertical}>
        <S.OverlayContainer>
            <S.Overlay>
              <Gap disableWrap>
                <SpaceName />
                <Box mr={.5}>
                  <Dropdown
                    icon='ellipsis-h'
                    iconPrefix='fas'
                    items={dropdownItems}
                    circle
                    compact
                  />
                </Box>
              </Gap>
            </S.Overlay>
            <S.OverlayBottom>
            <S.SpaceStats>
              <Spacer />
              <Counts 
                groupsCount={count.groups}
                channelsCount={count.channels}
                threadsCount={count.threads}
                messageCount={count.messages}
              />
            </S.SpaceStats>
            
            </S.OverlayBottom>
            <AspectRatio
              ratio={previewSrc ? 3/1 : 3/1}
              backgroundSrc={previewSrc ? previewSrc : undefined}
              coverBackground
            />
        </S.OverlayContainer>
      </S.SpaceCard>
    </ContextMenu>
  </AspectRatio>)
})

const S = {
  SpaceCard: styled.div<{
    expandVertical?: boolean
  }>`
    width: 100%;
    height: ${props => props.expandVertical ? '100%' : 'auto'};
    background: var(--F_Surface_1);
  `,
  OverlayContainer: styled.div`
    height: 100%;
    width: 100%;
    position: relative;
    top: 0;
    z-index: 2;
  `,
  Overlay: styled.div`
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 3;
    background: linear-gradient(to top, hsla(0, 0%, 7%, 0) 0%, hsla(0, 0%, 7%,.4) 40%, hsla(0, 0%, 7%,.5) 100%);
    button {
      background: black;
    }
  `,
  OverlayBottom: styled.div`
    position: absolute;
    bottom: 0;
    z-index: 1;
    width: 100%;
    background: linear-gradient(to bottom, hsla(0, 0%, 7%, 0) 0%, hsla(0, 0%, 7%,.4) 40%, hsla(0, 0%, 7%,.5) 100%);
  `,
  SpaceName: styled.div`
    width: 100%;
  `,
  SpaceStats: styled.div`
    width: calc(100% - .75rem);
    padding-bottom: .5rem;
    display: flex;
  `,
  PosterContainer: styled.div`
    border-radius: .75rem;
    overflow: hidden;
    width: 100%;
  `
}