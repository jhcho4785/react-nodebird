const express = require('express');
const { User, Post, Comment, Image, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const router = express.Router();

try {
  fs.accessSync('uploads');
} catch (e) {
  fs.mkdirSync('uploads');
}

AWS.config.update({
  region: 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'react-nodebird-s3',
    key(req, file, cb) {
      cb(null, `original/${Date.now()}_${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, //파일 용량 제한
});

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const hashtags = req.body.content.match(/#[^\s#]+/g);
    const post = await Post.create({
      content: req.body.content,
      UserId: req.user.id,
    });
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map((tag) => Hashtag.findOrCreate({ where: { name: tag.slice(1).toLowerCase() } })),
      ); //[[노드, true], [리액트, true]]
      await post.addHashtags(result.map((v) => v[0]));
    }
    if (req.body.image) {
      //이미지가 두 개 이상일 때
      if (Array.isArray(req.body.image)) {
        const images = await Promise.all(req.body.image.map((image) => Image.create({ src: image })));
        await post.addImages(images);
      } else {
        const image = await Image.create({ src: req.body.image });
        await post.addImages(image);
      }
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Image,
        },
        {
          model: Comment,
        },
        {
          model: User,
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(201).json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({ where: { id: req.params.postId } });
    res.json({ PostId: req.params.postId });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:postId/comment', isLoggedIn, async (req, res, next) => {
  const { content } = req.body;
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    const comment = await Comment.create({
      content: content,
      PostId: parseInt(req.params.postId),
      UserId: req.user.id,
    });
    res.status(201).json(comment);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.post('/:postId/retweet', isLoggedIn, async (req, res, next) => {
  const { content } = req.body;
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
      include: {
        model: Post,
        as: 'Retweet',
      },
    });
    if (!post) {
      return res.status(403).send('존재하지 않는 게시글입니다.');
    }
    if (req.user.id === post.UserId || (post.Retweet && post.Retweet.UserId === req.user.id)) {
      return res.status(403).send('자신의 글은 리트윗할 수 없습니다.');
    }
    const retweetTargetId = post.RetweetId || post.id;
    const exPost = await Post.findOne({
      where: {
        UserId: req.user.id,
        RetweetId: retweetTargetId,
      },
    });
    if (exPost) {
      return res.status(403).send('이미 리트윗했습니다.');
    }
    const retweet = await Post.create({
      UserId: req.user.id,
      RetweetId: retweetTargetId,
      content: 'retweet',
    });
    const retweetWithPrevPost = await Post.findOne({
      where: { id: retweet.id },
      include: [
        {
          model: Post,
          as: 'Retweet',
          include: [
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
            },
          ],
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(201).json(retweetWithPrevPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.patch('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.addLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:postId/like', isLoggedIn, async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        UserId: req.user.id,
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(403).send('게시글이 존재하지 않습니다.');
    }
    await post.removeLikers(req.user.id);
    res.json({ PostId: post.id, UserId: req.user.id });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

router.delete('/:postId', isLoggedIn, async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: req.params.postId,
        UserId: req.user.id,
      },
    });
    res.status(200).json({ PostId: req.params.postId });
  } catch (e) {
    console.error(e);
    next(e);
  }
});

//upload.array: 단일 태그에서 복수 파일, upload.fill: 인풋 태그가 두개 이상일 때, upload.single: 단일 파일, upload.none: 기타 텍스트 파일 등 - 프론트 input name이 인자와 맞아야 함
router.post('/images', isLoggedIn, upload.array('image'), async (req, res, next) => {
  //미리보기, 리사이징 등을 먼저 하기 위해 이미지를 먼저 올리고 컨텐츠를 후에 작성
  res.json(req.files.map((v) => v.location));
});

router.get('/:postId', async (req, res, next) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.postId,
      },
    });
    if (!post) {
      return res.status(404).send('존재하지 않는 게시글입니다.');
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: Post,
          as: 'Retweet',
          include: [
            {
              model: Image,
            },
          ],
        },
        {
          model: User,
          attributes: ['id', 'nickname'],
        },
        {
          model: Image,
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ['id', 'nickname'],
            },
          ],
        },
        {
          model: User,
          as: 'Likers',
          attributes: ['id'],
        },
      ],
    });
    res.status(200).json(fullPost);
  } catch (e) {
    console.error(e);
    next(e);
  }
});

module.exports = router;
