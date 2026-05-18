package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyEvaluation;
import com.ruoyi.toy.mapper.ToyEvaluationMapper;
import com.ruoyi.toy.service.IToyEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 评价Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyEvaluationServiceImpl implements IToyEvaluationService
{
    @Autowired
    private ToyEvaluationMapper evaluationMapper;

    /**
     * 根据产品ID查询评价列表
     */
    @Override
    public List<ToyEvaluation> selectEvaluationByProductId(Long productId)
    {
        return evaluationMapper.selectEvaluationByProductId(productId);
    }

    /**
     * 新增评价
     */
    @Override
    public int insertEvaluation(ToyEvaluation evaluation)
    {
        evaluation.setUserId(SecurityUtils.getUserId());
        evaluation.setNickName(SecurityUtils.getUsername());
        return evaluationMapper.insertEvaluation(evaluation);
    }

    /**
     * 删除评价
     */
    @Override
    public int deleteEvaluationById(Long id)
    {
        return evaluationMapper.deleteEvaluationById(id);
    }
}
