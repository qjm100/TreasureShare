package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyEvaluation;
import com.ruoyi.toy.service.IToyEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 评价Controller
 *
 * @author Ciami
 */
@RestController
@RequestMapping("/api/toy/evaluations")
public class EvaluationController extends BaseController
{
    @Autowired
    private IToyEvaluationService evaluationService;

    /**
     * 获取产品评价列表
     */
    @Anonymous
    @GetMapping("/{productId}")
    public AjaxResult list(@PathVariable Long productId)
    {
        return success(evaluationService.selectEvaluationByProductId(productId));
    }

    /**
     * 新增评价
     */
    @PostMapping
    public AjaxResult add(@RequestBody ToyEvaluation evaluation)
    {
        return toAjax(evaluationService.insertEvaluation(evaluation));
    }

    /**
     * 删除评价
     */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id)
    {
        return toAjax(evaluationService.deleteEvaluationById(id));
    }
}
