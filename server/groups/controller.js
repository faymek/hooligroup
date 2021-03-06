const express = require('express')
const model = require('../db/model.js')
const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')
const checkToken = require('../middleware/checkToken.js')
const getToken = require('../middleware/getToken.js')

// 所有group打印
const Groups = (req, res) => {
	model.Group.find({}, (err, doc) => {
		if (err) {
			console.log(err)
			res.json({
				success: false
			})
			return
		}
		res.send(doc)
	})
}

// 创建group
const Create = (req, res) => {
	let user = getToken(req, res)

	let groupCreate = new model.Group({
		name: req.body.name,
		type: req.body.type,
		description: req.body.description,
		admins: [user.id],
		sections: ['公告', '问答', '分享', '灌水', '其他']
	})
	// 将 objectid 转换为 用户创建时间
	groupCreate.create_time = moment(objectIdToTimestamp(groupCreate._id))
		.format('YYYY-MM-DD HH:mm:ss');
	groupCreate.save(err => {
		if (err) {
			console.log(err)
			res.json({
				success: false
			})
			return
		}
		res.json({
			success: true
		})
	})
}

// Group info
const GetGroupInfoById = (req, res) => {
	model.Group.findById(req.query.id)
		.populate({
			path: 'members',
			select: {
				password: 0,
				token: 0,
				groups: 0,
				create_time: 0
			}
		})
		.populate({
			path: 'admins',
			select: {
				password: 0,
				token: 0,
				groups: 0,
				create_time: 0
			}
		})
		.populate('events')
		.populate('topics')
		.exec((err, group) => {
			if (err || !group) {
				res.json({
					success: false
				})
				return
			}
			res.send(group)
		})
}

// Group info
const GetGroupSectionsById = (req, res) => {
	model.Group.findById(req.query.id).select({ "sections": 1})
		.exec((err, group) => {
			if (err || !group) {
				res.json({
					success: false
				})
				return
			}
			res.send(group.sections)
		})
}

module.exports = {
	Groups,
	Create,
	GetGroupInfoById,
	GetGroupSectionsById
}