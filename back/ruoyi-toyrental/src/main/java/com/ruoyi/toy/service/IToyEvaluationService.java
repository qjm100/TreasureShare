package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyEvaluation;
import java.util.List;

/**
 * 评价Service接口
 *
 * @author Ciami
 */
public interface IToyEvaluationService
{
    /**
     * 根据产品ID查询评价列表
     */
    List<ToyEvaluation> selectEvaluationByProductId(Long productId);

    /**
     * 新增评价
     */
    int insertEvaluation(ToyEvaluation evaluation);

    /**
     * 删除评价
     */
    int deleteEvaluationById(Long id);
}
