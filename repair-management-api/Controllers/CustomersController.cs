using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RepairManagementApi.DTOs;
using RepairManagementApi.Services;


namespace RepairManagementApi.Controllers;

[ApiController]
[Authorize]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;
    private readonly IBranchContext _branchContext;

    public CustomersController(ICustomerService customerService, IBranchContext branchContext)
    {
        _customerService = customerService;
        _branchContext = branchContext;
    }


    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CustomerResponseDto>> CreateCustomer([FromBody] CreateCustomerRequestDto request)
    {
        try
    {
        var created = await _customerService.CreateCustomerAsync(request);
        return CreatedAtAction(nameof(GetCustomerById), new { customerId = created.Id }, created);
    }
        catch (InvalidOperationException ex) when (ex.Message == "Branch_Not_Found.")
    {
        return NotFound(new
        {
            code = "BRANCH_NOT_FOUND",
            message = "The specified branch does not exist."
        });
    }
    catch (InvalidOperationException ex) when (ex.Message == "Duplicate_Phone_Number.")
    {
        return Conflict(new
        {
            code = "DUPLICATE_PHONE",
            message = "A customer with this phone number already exists in this branch."
            });
    }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<List<CustomerResponseDto>>> GetCustomers(
    [FromQuery] string? search)
    {
        if (_branchContext.BranchId is null)
        {
            return Forbid();
        }

        var customers = await _customerService.GetCustomersAsync(_branchContext.BranchId.Value, search);
        return Ok(customers);
    }

    [HttpGet("{customerId:guid}")]
    [Authorize(Roles = "Admin,Technician")]
    public async Task<ActionResult<CustomerResponseDto>> GetCustomerById(Guid customerId)
    {
        var customer = await _customerService.GetCustomerByIdAsync(customerId);
        if (customer is null)
        return NotFound();

    // Branch scoping: if user has a branch context, verify customer belongs to it
        if (_branchContext.BranchId.HasValue && customer.BranchId != _branchContext.BranchId.Value)
        {
            return Forbid();
        }

            return Ok(customer);
    }

    [HttpPut("{customerId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<CustomerResponseDto>> UpdateCustomer(
    Guid customerId,
    [FromBody] UpdateCustomerRequestDto request)
    {
        var existingCustomer = await _customerService.GetCustomerByIdAsync(customerId);
        
        if(existingCustomer is null)
        {
            return NotFound();
        }

        if (_branchContext.BranchId.HasValue && existingCustomer.BranchId != _branchContext.BranchId.Value)
        {
            return Forbid();
        }

        try
        {
            var updated = await _customerService.UpdateCustomerAsync(customerId, request);
            if (updated is null)
            {
                return NotFound();
            }

            return Ok(updated);
        }
        catch (InvalidOperationException ex) when (ex.Message == "Duplicate_Phone_Number.")
        {
            return Conflict(new
            {
                code = "DUPLICATE_PHONE",
                message = "A customer with this phone number already exists in this branch."
            });
        }
    }

}