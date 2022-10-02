import * as React from "react";
import { useState } from "react";
import { NftCategory } from "services/nft";
import styled from 'styled-components'

interface NftCategoryProps {
  readonly categories: NftCategory[];
  readonly activeCategoryId: number;
}

export function CategoryTab({ categories, activeCategoryId, setActiveCategoryId }) {
  const getActiveTabIfActive = (tabId) => (
    activeCategoryId === tabId ? 'active' : ''
  )
  return (
    <Container>
      {/* <CategoryDiv className="desktop-section category-menus">
      {categories.length > 0 && categories.map((category, idx) => (
        (idx < 11) && (
        <span key={category.id} 
          onClick={() => setActiveCategoryId(category.id)}
          className={`category-menu ${getActiveTabIfActive(category.id)}`}
        >
        {category.name}
        </span>
        )
      ))}
      </CategoryDiv>
      <CategoryDiv className="mobile-section category-menus">
      {categories.length > 0 && categories.map((category, idx) => (
        (idx < 5) && (
        <span key={category.id} 
          onClick={() => setActiveCategoryId(category.id)}
          className={`category-menu ${getActiveTabIfActive(category.id)}`}
        >
        {category.name}
        </span>
        )
      ))}
      </CategoryDiv> */}
      <CategoryDiv className="desktop-section category-menus">
        {categories.length > 0 &&
          categories.map(
            (category, idx) =>
              idx < 11 && (
                <CategoryItem
                  key={category.id}
                  onClick={() => setActiveCategoryId(category.name)}
                  isActive={getActiveTabIfActive(category.name)}
                >
                  {category.name}
                </CategoryItem>
              )
          )
        }
      </CategoryDiv>
    </Container>
  );
}

const Container = styled.div`
  margin: 30px 0;
  @media (max-width: 480px) {
    width: 1366px;
  }
`

const CategoryDiv = styled.div``

const CategoryItem = styled.div<{ isActive: boolean }>`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 0;
  cursor: pointer;
  width: 130px;
  text-align: center;
  color: ${({ isActive }) => (isActive ? 'white' : 'rgba(255,255,255,0.5)')};
  @media (max-width: 480px) {
    width: 114px;
    font-size: 12px;
  }
`