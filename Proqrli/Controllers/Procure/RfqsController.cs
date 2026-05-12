using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProqrLi.Data;
using ProqrLi.Models;
using ProqrLi.DTOs;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ProqrLi.Controllers.Procure
{
    [ApiController]
    [Route("api/[controller]")]
    public class RfqsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public RfqsController(ApplicationDbContext db)
        {
            _db = db;
        }

      
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string search = "", [FromQuery] string status = "All")
        {
            var buyerTenantId = await _db.Tenants
                .Where(t => t.TenantType == "Buyer")
                .Select(t => t.TenantID)
                .FirstOrDefaultAsync();

            if (buyerTenantId == 0) buyerTenantId = 1;

            var query = _db.RequestForQuotations
                .Include(r => r.PurchaseRequisition)
                .Include(r => r.VendorInvitations)
                .Where(r => r.TenantID == buyerTenantId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(r => r.Title.Contains(search) || r.RFQNumber.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "All")
            {
                query = query.Where(r => r.Status == status);
            }

            var totalCount = await query.CountAsync();
            var rfqs = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dtos = rfqs.Select(r => new RfqDto
            {
                Id = r.RFQID.ToString(),
                RfqNumber = r.RFQNumber ?? $"RFQ-{r.RFQID:D4}",
                Title = r.Title,
                Category = r.Category ?? "Uncategorized",
                PrRef = r.PurchaseRequisition?.PRNumber ?? "N/A",
                ResponsesReceived = r.VendorInvitations.Count(i => i.HasResponded),
                InvitedVendors = r.VendorInvitations.Count,
                ClosesAt = r.ClosesAt.ToString("yyyy-MM-dd"),
                Status = r.Status,
                LinkedPrId = r.LinkedPRID?.ToString() ?? "",
                Notes = r.Notes ?? "",
                SourcingRoute = r.SourcingRoute
            }).ToList();

            return Ok(new { data = dtos, total = totalCount, page, pageSize });
        }

        // GET /api/rfqs/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var rfq = await _db.RequestForQuotations
                .Include(r => r.PurchaseRequisition)
                .Include(r => r.VendorInvitations)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound();

            return Ok(new RfqDto
            {
                Id = rfq.RFQID.ToString(),
                RfqNumber = rfq.RFQNumber ?? $"RFQ-{rfq.RFQID:D4}",
                Title = rfq.Title,
                Category = rfq.Category ?? "Uncategorized",
                PrRef = rfq.PurchaseRequisition?.PRNumber ?? "N/A",
                ResponsesReceived = rfq.VendorInvitations.Count(i => i.HasResponded),
                InvitedVendors = rfq.VendorInvitations.Count,
                ClosesAt = rfq.ClosesAt.ToString("yyyy-MM-dd"),
                Status = rfq.Status,
                LinkedPrId = rfq.LinkedPRID?.ToString() ?? "",
                Notes = rfq.Notes ?? "",
                SourcingRoute = rfq.SourcingRoute
            });
        }
        // GET /api/rfqs/5/detail
        [HttpGet("{id:int}/detail")]
        public async Task<IActionResult> GetDetail(int id)
        {
            var rfq = await _db.RequestForQuotations
                .Include(r => r.PurchaseRequisition)
                .Include(r => r.VendorInvitations)
                    .ThenInclude(vi => vi.VendorTenant)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound();

            var rfqDto = new RfqDto
            {
                Id = rfq.RFQID.ToString(),
                RfqNumber = rfq.RFQNumber ?? $"RFQ-{rfq.RFQID:D4}",
                Title = rfq.Title,
                Category = rfq.Category ?? "Uncategorized",
                PrRef = rfq.PurchaseRequisition?.PRNumber ?? "N/A",
                ResponsesReceived = rfq.VendorInvitations.Count(i => i.HasResponded),
                InvitedVendors = rfq.VendorInvitations.Count,
                ClosesAt = rfq.ClosesAt.ToString("yyyy-MM-dd"),
                Status = rfq.Status,
                LinkedPrId = rfq.LinkedPRID?.ToString() ?? "",
                Notes = rfq.Notes ?? "",
                SourcingRoute = rfq.SourcingRoute
            };

            var lines = new List<RfqLineDto>();
            if (rfq.LinkedPRID.HasValue)
            {
                var prItems = await _db.RequisitionItems
                    .Include(ri => ri.Item)
                    .Where(ri => ri.PRID == rfq.LinkedPRID.Value)
                    .ToListAsync();

                lines = prItems.Select(ri => new RfqLineDto
                {
                    Id = ri.ReqItemID.ToString(),
                    Sku = ri.Item?.ItemCode ?? "",
                    Description = ri.Item?.ItemName ?? "",
                    Qty = ri.Quantity,
                    Uom = ri.Item?.UnitOfMeasure ?? "EA",
                    TargetPrice = ri.EstimatedPrice,
                    Notes = ri.Specifications ?? ""
                }).ToList();
            }

            var invitations = rfq.VendorInvitations.Select(vi => new RfqInvitationDto
            {
                Id = vi.InvitationID.ToString(),
                VendorId = vi.VendorTenantID.ToString(),
                VendorName = vi.VendorTenant?.CompanyName ?? "Unknown Vendor",
                VendorStatus = vi.Status,
                InvitedAt = vi.InvitedAt.ToString("yyyy-MM-dd")
            }).ToList();

            var quotesList = await _db.RfqResponses
                .Include(rr => rr.VendorTenant)
                .Where(rr => rr.RFQID == id)
                .OrderBy(rr => rr.TotalAmount)
                .ToListAsync();

            var quotes = quotesList.Select((rr, index) => new RfqQuoteDto
            {
                Id = rr.ResponseID.ToString(),
                VendorId = rr.VendorTenantID.ToString(),
                VendorName = rr.VendorTenant?.CompanyName ?? "Unknown Vendor",
                Total = rr.TotalAmount,
                Rank = index + 1,
                Status = rr.Status,
                SubmittedAt = rr.SubmittedAt.ToString("yyyy-MM-dd")
            }).ToList();

            var detail = new RfqDetailDto
            {
                Rfq = rfqDto,
                Lines = lines,
                Invitations = invitations,
                Quotes = quotes
            };

            return Ok(detail);
        }

       
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateRfqDto dto)
        {
            var buyerTenantId = await _db.Tenants
                .Where(t => t.TenantType == "Buyer")
                .Select(t => t.TenantID)
                .FirstOrDefaultAsync();

            if (buyerTenantId == 0) buyerTenantId = 1;

            var rfq = new RequestForQuotation
            {
                TenantID = buyerTenantId,
                Title = dto.Title,
                Category = dto.Category,
                ClosesAt = DateTime.Parse(dto.ClosesAt),
                Notes = dto.Notes,
                SourcingRoute = dto.SourcingRoute ?? "rfq",
                Status = "Draft",
                CreatedByUserID = 1 
            };

            if (int.TryParse(dto.LinkedPrId, out int prId))
            {
                rfq.LinkedPRID = prId;
                var pr = await _db.PurchaseRequisitions.FindAsync(prId);
                if (pr != null)
                {
                    pr.Status = "Converted to RFQ";
                }
            }

            _db.RequestForQuotations.Add(rfq);
            await _db.SaveChangesAsync();

            rfq.RFQNumber = $"RFQ-{rfq.RFQID:D4}";
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = rfq.RFQID }, new { id = rfq.RFQID.ToString() });
        }

        [HttpPatch("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRfqDto dto)
        {
            var rfq = await _db.RequestForQuotations.FindAsync(id);
            if (rfq == null) return NotFound();

            if (dto.Title != null) rfq.Title = dto.Title;
            if (dto.Category != null) rfq.Category = dto.Category;
            if (dto.ClosesAt != null) rfq.ClosesAt = DateTime.Parse(dto.ClosesAt);
            if (dto.Notes != null) rfq.Notes = dto.Notes;
            if (dto.SourcingRoute != null) rfq.SourcingRoute = dto.SourcingRoute;
            if (dto.Status != null) rfq.Status = dto.Status;

            await _db.SaveChangesAsync();
            return Ok(new { id = rfq.RFQID.ToString() });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var rfq = await _db.RequestForQuotations.FindAsync(id);
            if (rfq == null) return NotFound();

            rfq.Status = "Cancelled";
            await _db.SaveChangesAsync();
            return NoContent();
        }

      
        [HttpPost("{id:int}/invite")]
        public async Task<IActionResult> InviteVendors(int id, [FromBody] InviteVendorsDto dto)
        {
            var rfq = await _db.RequestForQuotations
                .Include(r => r.VendorInvitations)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound();

            var existingVendorIds = rfq.VendorInvitations.Select(vi => vi.VendorTenantID).ToHashSet();

            foreach (var vendorId in dto.VendorIds)
            {
                if (!existingVendorIds.Contains(vendorId))
                {
                    rfq.VendorInvitations.Add(new RfqVendorInvitation
                    {
                        VendorTenantID = vendorId,
                        Status = "Pending",
                        InvitedAt = DateTime.UtcNow
                    });
                }
            }

          
            if (rfq.Status == "Draft" && dto.VendorIds.Any())
            {
                rfq.Status = "Open";
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Vendors invited successfully" });
        }

     
        [HttpGet("{id:int}/suggested-vendors")]
        public async Task<IActionResult> GetSuggestedVendors(int id)
        {
            var rfq = await _db.RequestForQuotations
                .Include(r => r.VendorInvitations)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound();

            var buyerTenantId = rfq.TenantID;

            var links = await _db.AccreditationLinks
                .Include(a => a.VendorTenant)
                .Where(a => a.BuyerTenantID == buyerTenantId && a.Status == "Accredited")
                .ToListAsync();

            var alreadyInvited = rfq.VendorInvitations
                .Select(vi => vi.VendorTenantID)
                .ToHashSet();

            var rfqCategory = (rfq.Category ?? "").ToLower();
            var matchKeywords = rfqCategory switch
            {
                "industrial equipment" => new[] { "industrial", "manufacturing", "equipment" },
                "hydraulics"           => new[] { "hydraulics", "fluid", "industrial" },
                "chemicals"            => new[] { "chemical", "industrial" },
                "fasteners"            => new[] { "fastener", "hardware", "industrial" },
                "electrical"           => new[] { "electrical", "electronics", "industrial" },
                "mro"                  => new[] { "mro", "industrial", "maintenance" },
                "raw materials"        => new[] { "raw", "materials", "manufacturing" },
                "safety"               => new[] { "safety", "industrial", "mro" },
                _                      => new[] { rfqCategory }
            };

            var result = links
                .Select(l =>
                {
                    var industry = (l.VendorTenant?.Industry ?? "").ToLower();
                    var isMatch = matchKeywords.Any(kw => industry.Contains(kw))
                                  || industry == rfqCategory;
                    return new
                    {
                        vendorTenantId = l.VendorTenantID,
                        linkId         = l.LinkID,
                        companyName    = l.VendorTenant?.CompanyName ?? "",
                        industry       = l.VendorTenant?.Industry ?? "",
                        isMatch,
                        alreadyInvited = alreadyInvited.Contains(l.VendorTenantID),
                    };
                })
                
                .OrderByDescending(v => v.isMatch)
                .ThenBy(v => v.companyName)
                .ToList();

            return Ok(result);
        }

        public record RespondToRfqRequest(decimal TotalAmount, string? Remarks);

        [HttpPost("{id:int}/respond")]
        public async Task<IActionResult> RespondToRfq(int id, [FromBody] RespondToRfqRequest req)
        {
          
            var tenantIdStr = User.FindFirst("tenant_id")?.Value;
            if (!int.TryParse(tenantIdStr, out var vendorTenantId))
                return Unauthorized(new { error = "Invalid session." });

            var rfq = await _db.RequestForQuotations
                .Include(r => r.VendorInvitations)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound(new { error = "RFQ not found." });

           
            var invitation = rfq.VendorInvitations
                .FirstOrDefault(vi => vi.VendorTenantID == vendorTenantId);
            if (invitation == null)
                return StatusCode(403, new { error = "You were not invited to this RFQ." });

            if (rfq.Status == "Awarded" || rfq.Status == "Cancelled")
                return BadRequest(new { error = "This RFQ is no longer accepting responses." });

          
            var existing = await _db.RfqResponses
                .FirstOrDefaultAsync(r => r.RFQID == id && r.VendorTenantID == vendorTenantId);

            if (existing == null)
            {
                _db.RfqResponses.Add(new RfqResponse
                {
                    RFQID          = id,
                    VendorTenantID = vendorTenantId,
                    TotalAmount    = req.TotalAmount,
                    SubmittedAt    = DateTime.UtcNow,
                    Status         = "Submitted",
                    Remarks        = req.Remarks ?? "",
                });
            }
            else
            {
                existing.TotalAmount = req.TotalAmount;
                existing.Remarks     = req.Remarks ?? existing.Remarks;
                existing.SubmittedAt = DateTime.UtcNow;
                existing.Status      = "Submitted";
            }

          
            invitation.HasResponded = true;
            invitation.Status = "Quoted";

            await _db.SaveChangesAsync();
            return Ok(new { message = "Quotation submitted successfully." });
        }

        
        [HttpGet("vendor-inbox")]
        public async Task<IActionResult> GetVendorInbox()
        {
            var tenantIdStr = User.FindFirst("tenant_id")?.Value;
            if (!int.TryParse(tenantIdStr, out var vendorTenantId))
                return Unauthorized(new { error = "Invalid session." });

            var invitations = await _db.RfqVendorInvitations
                .Include(vi => vi.RequestForQuotation)
                    .ThenInclude(r => r.Tenant)
                .Where(vi => vi.VendorTenantID == vendorTenantId)
                .OrderByDescending(vi => vi.InvitedAt)
                .ToListAsync();

            var rfqIds = invitations.Select(vi => vi.RFQID).ToList();

            var responses = await _db.RfqResponses
                .Where(r => rfqIds.Contains(r.RFQID) && r.VendorTenantID == vendorTenantId)
                .ToDictionaryAsync(r => r.RFQID);

            var result = invitations.Select(vi =>
            {
                var rfq = vi.RequestForQuotation;
                responses.TryGetValue(vi.RFQID, out var myResponse);
                return new
                {
                    rfqId          = rfq.RFQID.ToString(),
                    rfqNumber      = rfq.RFQNumber ?? $"RFQ-{rfq.RFQID:D4}",
                    title          = rfq.Title,
                    category       = rfq.Category ?? "",
                    closesAt       = rfq.ClosesAt.ToString("yyyy-MM-dd"),
                    rfqStatus      = rfq.Status,
                    inviteStatus   = vi.Status,
                    notes          = rfq.Notes ?? "",
                    buyerName      = rfq.Tenant?.CompanyName ?? "Buyer",
                    myQuote        = myResponse == null ? null : new
                    {
                        responseId  = myResponse.ResponseID.ToString(),
                        totalAmount = myResponse.TotalAmount,
                        status      = myResponse.Status,
                        submittedAt = myResponse.SubmittedAt.ToString("yyyy-MM-dd"),
                        remarks     = myResponse.Remarks,
                    },
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPost("{id:int}/award/{responseId:int}")]
        public async Task<IActionResult> AwardQuote(int id, int responseId)
        {            var rfq = await _db.RequestForQuotations
                .Include(r => r.PurchaseRequisition)
                .Include(r => r.VendorInvitations)
                .FirstOrDefaultAsync(r => r.RFQID == id);

            if (rfq == null) return NotFound("RFQ not found");

            var response = await _db.RfqResponses.FindAsync(responseId);
            if (response == null || response.RFQID != id) return NotFound("Response not found");

            response.Status = "Awarded";
            rfq.Status = "Awarded";

            var po = new PurchaseOrder
            {
                TenantID = rfq.TenantID,
                PRID = rfq.LinkedPRID,
                VendorTenantID = response.VendorTenantID,
                CreatedByUserID = rfq.CreatedByUserID,
                PODate = DateTime.UtcNow,
                Status = "Draft", 
                TotalAmount = response.TotalAmount,
                PaymentTerms = "Net 30" 
            };

            _db.PurchaseOrders.Add(po);
            await _db.SaveChangesAsync(); 

            po.PONumber = $"PO-{po.POID:D4}";

            if (rfq.LinkedPRID.HasValue)
            {
                var prItems = await _db.RequisitionItems
                    .Where(ri => ri.PRID == rfq.LinkedPRID.Value)
                    .ToListAsync();

                foreach (var item in prItems)
                {
                    _db.POItems.Add(new POItem
                    {
                        POID = po.POID,
                        ItemID = item.ItemID,
                        Quantity = item.Quantity,
                        UnitPrice = item.EstimatedPrice,
                        LineTotal = item.Quantity * item.EstimatedPrice
                    });
                }

            
                rfq.PurchaseRequisition.Status = "Converted to PO";
            }

            await _db.SaveChangesAsync();

            return Ok(new { poId = po.POID.ToString(), poNumber = po.PONumber });
        }
    }
}
