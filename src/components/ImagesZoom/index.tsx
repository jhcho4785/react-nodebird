import { FC, useState } from 'react';
import Slick from 'react-slick';
import {
  CloseBtn,
  globalStyle,
  Header,
  ImgWrapper,
  Indicator,
  Overlay,
  SlickWrapper,
} from '@/components/ImagesZoom/styles';
import { Global } from '@emotion/react';
import Image from 'next/image';
import { backUrl } from '@/config/config';

interface Props {
  images: { src: string }[];
  onClose: () => void;
}

const ImagesZoom: FC<Props> = ({ images, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  return (
    <Overlay>
      <Header>
        <h1>상세 이미지</h1>
        <CloseBtn onClick={onClose}>X</CloseBtn>
      </Header>
      <SlickWrapper>
        <div>
          <Global styles={globalStyle} />
          <Slick
            initialSlide={0}
            afterChange={(slide) => setCurrentSlide(slide)}
            infinite
            arrows={false}
            slidesToShow={1}
          >
            {images.map((v) => (
              <ImgWrapper key={v.src}>
                <Image src={v.src.replace(/\/thumb\//, '/original/')} alt={v.src} />
              </ImgWrapper>
            ))}
          </Slick>
          <Indicator>
            <div>
              {currentSlide + 1}/{images.length}
            </div>
          </Indicator>
        </div>
      </SlickWrapper>
    </Overlay>
  );
};

export default ImagesZoom;
